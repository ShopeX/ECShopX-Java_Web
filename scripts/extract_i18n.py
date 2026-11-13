#!/usr/bin/env python3
"""
扫描文件中未被 t() / $t() 包裹的中文字符串，输出需要翻译的条目。

用法：
    python3 scripts/extract_i18n.py <file> [<file> ...]

输出格式（每行一条）：
    <file_path>\t<chinese_text>
"""

import re
import sys
from pathlib import Path

# 匹配中文字符范围
CJK_RE = re.compile(r'[\u4e00-\u9fff\u3400-\u4dbf]+')

# 已国际化的模式：t('...') $t('...') t("...") $t("...")
ALREADY_I18N_RE = re.compile(r'\$?t\([\'"][^\'"]+[\'"]\)')

# 模板注释
COMMENT_RE = re.compile(r'<!--.*?-->', re.DOTALL)

# script 块内的注释
JS_COMMENT_RE = re.compile(r'//[^\n]*|/\*.*?\*/', re.DOTALL)


def strip_translated(text: str) -> str:
    """移除已翻译的 t() 调用，避免误报"""
    return ALREADY_I18N_RE.sub('', text)


def extract_from_file(file_path: str) -> list[tuple[str, str]]:
    path = Path(file_path)
    if not path.exists():
        print(f"文件不存在: {file_path}", file=sys.stderr)
        return []

    content = path.read_text(encoding='utf-8')

    # 移除注释
    content_clean = COMMENT_RE.sub('', content)
    content_clean = JS_COMMENT_RE.sub('', content_clean)

    # 移除已翻译内容
    content_clean = strip_translated(content_clean)

    results = []
    for match in CJK_RE.finditer(content_clean):
        text = match.group()
        results.append((file_path, text))

    return results


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python3 scripts/extract_i18n.py <file> [<file> ...]", file=sys.stderr)
        sys.exit(1)

    all_results = []
    for f in sys.argv[1:]:
        all_results.extend(extract_from_file(f))

    for file_path, text in all_results:
        print(f"{file_path}\t{text}")
