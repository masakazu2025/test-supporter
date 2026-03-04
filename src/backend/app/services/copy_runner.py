"""Worker のコピー処理（1ジョブ分）"""

import uuid
from dataclasses import dataclass
from pathlib import Path

from app.infra.field_extractor import extract_fields
from app.infra.file_transfer import atomic_copy, atomic_move
from app.infra.resolver import resolve
from app.schemas.collection import ActionMode, CollectionTarget
from app.services.repository import CollectedFileRecord, CollectedFileRepository


@dataclass
class CopyJob:
    terminal: str
    src_file: Path       # 採取元（UNCパス or ローカルパス）
    target: CollectionTarget


def run_copy(
    job: CopyJob,
    staging_dir: Path,
    repo: CollectedFileRepository,
) -> None:
    """
    1ジョブ分のコピー処理を実行する。

    手順:
    1. staging へ atomic_copy（ネットワーク操作はここだけ）
    2. field_extractor でメタデータ抽出（staging ローカルファイルから）
    3. resolver で dst_dir・ファイル名を解決
    4. dst_dir を作成
    5. action に応じて staging → dst へ move（常に atomic）
    6. repo.save でDB登録
    """
    # ① staging へコピー（ユニークなtmpファイル名で衝突防止）
    staging_tmp = staging_dir / f"{uuid.uuid4().hex}.tmp"
    atomic_copy(job.src_file, staging_tmp)

    try:
        # ② メタデータ抽出（staging のローカルファイルから、mtime保持済み）
        # original_name を渡すことで stem/ext/filename regex を元ファイル名で解決する
        metadata = extract_fields(
            local_file=staging_tmp,
            terminal=job.terminal,
            field_defs=job.target.fields,
            original_name=job.src_file.name,
        )

        # ③ dst_dir とファイル名を解決
        dst_dir = Path(resolve(job.target.dst_dir, metadata))
        if job.target.rename is not None:
            dst_name = resolve(job.target.rename, metadata)
        else:
            dst_name = job.src_file.name

        dst_path = dst_dir / dst_name

        # ④ dst_dir を作成
        dst_dir.mkdir(parents=True, exist_ok=True)

        # ⑤ staging → dst へ atomic_move（staging 内ファイルは常に削除）
        atomic_move(staging_tmp, dst_path)

        # ⑥ action=move のとき元ファイルも削除
        if job.target.action == ActionMode.move:
            job.src_file.unlink(missing_ok=True)

        # ⑦ DB 登録
        repo.save(CollectedFileRecord(
            terminal=job.terminal,
            dst_path=dst_path,
            metadata=metadata,
        ))

    except Exception:
        # staging_tmp が残っていれば削除
        if staging_tmp.exists():
            staging_tmp.unlink()
        raise
