"""採取ファイルのリポジトリ抽象（Protocol）"""

from dataclasses import dataclass
from pathlib import Path
from typing import Protocol


@dataclass
class CollectedFileRecord:
    terminal: str
    dst_path: Path
    metadata: dict[str, str]


class CollectedFileRepository(Protocol):
    def save(self, record: CollectedFileRecord) -> None: ...
