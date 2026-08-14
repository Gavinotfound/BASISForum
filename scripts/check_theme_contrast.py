from __future__ import annotations

THEMES = {
    "archive": {
        "background": "#F7F0E3",
        "text": "#15211D",
        "muted": "#526158",
        "divider": "#6C756C",
        "interactive": "#1B5E76",
        "interactive_text": "#F7F0E3",
        "destructive": "#812D37",
        "destructive_text": "#FFFFFF",
    },
    "verdigris": {
        "background": "#0D1B16",
        "text": "#EAF7EF",
        "muted": "#B0C7BA",
        "divider": "#557064",
        "interactive": "#1F7A6E",
        "interactive_text": "#FFFFFF",
        "destructive": "#9C3444",
        "destructive_text": "#FFFFFF",
    },
    "signal": {
        "background": "#151515",
        "text": "#F4F4F1",
        "muted": "#C3C3BB",
        "divider": "#77776F",
        "interactive": "#F2C94C",
        "interactive_text": "#151515",
        "destructive": "#B43B4A",
        "destructive_text": "#FFFFFF",
    },
    "ultraviolet": {
        "background": "#13131D",
        "text": "#F5F3FF",
        "muted": "#C3C0D1",
        "divider": "#6D6A80",
        "interactive": "#5364C9",
        "interactive_text": "#FFFFFF",
        "destructive": "#AD3C62",
        "destructive_text": "#FFFFFF",
    },
    "sakura": {
        "background": "#FFF6F8",
        "text": "#2A1420",
        "muted": "#6B4B5B",
        "divider": "#9A6D7D",
        "interactive": "#A82E5B",
        "interactive_text": "#FFFFFF",
        "destructive": "#7B263D",
        "destructive_text": "#FFFFFF",
    },
    "studio": {
        "background": "#EEF3F8",
        "text": "#10233A",
        "muted": "#465B70",
        "divider": "#6D8092",
        "interactive": "#165D9C",
        "interactive_text": "#FFFFFF",
        "destructive": "#7A293C",
        "destructive_text": "#FFFFFF",
    },
}


def linear_channel(channel: int) -> float:
    value = channel / 255
    return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4


def luminance(hex_value: str) -> float:
    red, green, blue = (int(hex_value[index:index + 2], 16) for index in (1, 3, 5))
    return 0.2126 * linear_channel(red) + 0.7152 * linear_channel(green) + 0.0722 * linear_channel(blue)


def contrast(foreground: str, background: str) -> float:
    first, second = sorted((luminance(foreground), luminance(background)), reverse=True)
    return (first + 0.05) / (second + 0.05)


for name, tokens in THEMES.items():
    pairs = {
        "text/background": (tokens["text"], tokens["background"]),
        "muted/background": (tokens["muted"], tokens["background"]),
        "divider/background": (tokens["divider"], tokens["background"]),
        "interactive/button text": (tokens["interactive_text"], tokens["interactive"]),
        "destructive/button text": (tokens["destructive_text"], tokens["destructive"]),
    }
    print(f"{name.upper()}")
    for label, (foreground, background) in pairs.items():
        print(f"  {label:26} {contrast(foreground, background):.2f}:1")
