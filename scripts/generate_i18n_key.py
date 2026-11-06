#!/usr/bin/env python3
"""
生成 i18n key。
规则：md5(文件相对路径)[:8] + '.' + md5(翻译内容)[:6]

用法：
    python3 scripts/generate_i18n_key.py <relative_file_path> <text>

示例：
    python3 scripts/generate_i18n_key.py app/components/BCCartItem/BCCartItem.vue "确认删除该商品？"
"""

import hashlib
import sys


def generate_key(file_path: str, text: str) -> str:
    path_hash = hashlib.md5(file_path.encode()).hexdigest()[:8]
    text_hash = hashlib.md5(text.encode()).hexdigest()[:6]
    return f"{path_hash}.{text_hash}"


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("用法: python3 scripts/generate_i18n_key.py <relative_file_path> <text>", file=sys.stderr)
        sys.exit(1)
    file_path = sys.argv[1]
    text = sys.argv[2]
    print(generate_key(file_path, text))
