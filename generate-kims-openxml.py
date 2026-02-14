#!/usr/bin/env python3
"""
재료연 보유기술 현황과 사업화 과제 - python-pptx (OpenXML) 기반 생성
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.chart import XL_CHART_TYPE, XL_LEGEND_POSITION, XL_LABEL_POSITION
from pptx.chart.data import CategoryChartData
from pptx.oxml.ns import qn
import copy

# ── Design Tokens ──────────────────────────────────────────
NAVY = RGBColor(0x1B, 0x2A, 0x4A)
DARK_NAVY = RGBColor(0x0F, 0x1B, 0x33)
GOLD = RGBColor(0xC5, 0xA5, 0x5A)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT_GRAY = RGBColor(0xF5, 0xF5, 0xF5)
DARK_TEXT = RGBColor(0x33, 0x33, 0x33)
MID_TEXT = RGBColor(0x66, 0x66, 0x66)

CHART_BLUE = RGBColor(0x3A, 0x7B, 0xD5)
CHART_ORANGE = RGBColor(0xE8, 0x73, 0x4A)
CHART_GREEN = RGBColor(0x5C, 0xB8, 0x5C)
CHART_YELLOW = RGBColor(0xF0, 0xC0, 0x40)
CHART_PURPLE = RGBColor(0x9B, 0x59, 0xB6)
CHART_TEAL = RGBColor(0x1A, 0xBC, 0x9C)
CHART_GRAY = RGBColor(0x99, 0x99, 0x99)

BAR_BLUE = RGBColor(0x4A, 0x8B, 0xC2)
BAR_GOLD = RGBColor(0xD4, 0xA8, 0x43)

FONT_NAME = "맑은 고딕"
FONT_NAME_EN = "Calibri"

# ── Helpers ────────────────────────────────────────────────

def add_textbox(slide, left, top, width, height, text,
                font_size=12, font_name=FONT_NAME, bold=False,
                color=DARK_TEXT, alignment=PP_ALIGN.LEFT,
                anchor=MSO_ANCHOR.MIDDLE):
    """Add a textbox with specified styling."""
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    tf.auto_size = None
    tf.margin_top = 0
    tf.margin_bottom = 0
    tf.margin_left = Pt(4)
    tf.margin_right = Pt(4)
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.name = font_name
    p.font.bold = bold
    p.font.color.rgb = color
    p.alignment = alignment
    # Set vertical alignment via XML
    bodyPr = tf.paragraphs[0]._p.getparent().getparent().find(qn('a:bodyPr'))
    if bodyPr is not None:
        bodyPr.set('anchor', 'ctr' if anchor == MSO_ANCHOR.MIDDLE else 't')
    return txBox


def add_rect(slide, left, top, width, height, fill_color, line_color=None):
    """Add a filled rectangle shape."""
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    if line_color:
        shape.line.color.rgb = line_color
        shape.line.width = Pt(1)
    else:
        shape.line.fill.background()
    # Remove text frame default margin
    return shape


def add_rounded_rect(slide, left, top, width, height, fill_color, line_color=None):
    """Add a rounded rectangle."""
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    if line_color:
        shape.line.color.rgb = line_color
        shape.line.width = Pt(1)
    else:
        shape.line.fill.background()
    return shape


def set_chart_font(chart, size=8, color=MID_TEXT):
    """Set chart default font."""
    try:
        chart.font.size = Pt(size)
        chart.font.color.rgb = color
        chart.font.name = FONT_NAME
    except:
        pass


def style_axis(axis, font_size=8, color=MID_TEXT, has_gridlines=True, gridline_color=None):
    """Style a chart axis."""
    axis.has_title = False
    tf = axis.tick_labels
    tf.font.size = Pt(font_size)
    tf.font.color.rgb = color
    tf.font.name = FONT_NAME
    if has_gridlines and gridline_color:
        axis.major_gridlines.format.line.color.rgb = gridline_color
        axis.major_gridlines.format.line.width = Pt(0.5)
    elif not has_gridlines:
        axis.has_major_gridlines = False


# ── Create Presentation ───────────────────────────────────

prs = Presentation()
prs.slide_width = Inches(13.333)   # 16:9 widescreen
prs.slide_height = Inches(7.5)

slide_layout = prs.slide_layouts[6]  # Blank layout
slide = prs.slides.add_slide(slide_layout)

SW = Inches(13.333)
SH = Inches(7.5)

# ============================================================
# 1. HEADER BAR
# ============================================================
header_h = Inches(1.1)

# Navy background
add_rect(slide, Inches(0), Inches(0), SW, header_h, NAVY)

# Gold accent line (left edge)
add_rect(slide, Inches(0), Inches(0), Inches(0.08), header_h, GOLD)

# Main title
add_textbox(slide, Inches(0.5), Inches(0.1), Inches(9), Inches(0.65),
            "재료연 보유기술 현황과 사업화 과제",
            font_size=28, bold=True, color=WHITE, alignment=PP_ALIGN.LEFT)

# Subtitle
add_textbox(slide, Inches(0.5), Inches(0.7), Inches(9), Inches(0.35),
            "2015~2024 특허출원 및 기술이전 실적 분석",
            font_size=13, color=GOLD, alignment=PP_ALIGN.LEFT)

# KIMS logo text
add_textbox(slide, Inches(11.2), Inches(0.2), Inches(1.8), Inches(0.7),
            "KIMS", font_size=24, font_name="Arial", bold=True,
            color=GOLD, alignment=PP_ALIGN.CENTER)

# ============================================================
# 2. TOP-LEFT: LINE CHART - 연도별 특허출원 동향
# ============================================================
section_top = Inches(1.3)
chart_top = Inches(1.85)

# Section title
add_textbox(slide, Inches(0.5), section_top, Inches(4.5), Inches(0.45),
            "연도별 특허출원 동향",
            font_size=15, bold=True, color=NAVY)

# Badge: 총 566건
badge = add_rounded_rect(slide, Inches(4.2), Inches(1.35), Inches(1.2), Inches(0.35), NAVY)
add_textbox(slide, Inches(4.2), Inches(1.35), Inches(1.2), Inches(0.35),
            "총 566건", font_size=11, bold=True, color=WHITE, alignment=PP_ALIGN.CENTER)

# Line chart data
chart_data = CategoryChartData()
chart_data.categories = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024']
chart_data.add_series('특허출원', (45, 52, 68, 72, 65, 60, 58, 55, 48, 43))

chart_frame = slide.shapes.add_chart(
    XL_CHART_TYPE.LINE_MARKERS,
    Inches(0.4), chart_top, Inches(5.6), Inches(2.85),
    chart_data
)
chart = chart_frame.chart
chart.has_legend = False
chart.has_title = False

# Style line
series = chart.series[0]
series.format.line.color.rgb = CHART_BLUE
series.format.line.width = Pt(2.5)
series.marker.style = 8  # XL_MARKER_STYLE.CIRCLE
series.marker.size = 8
series.marker.format.fill.solid()
series.marker.format.fill.fore_color.rgb = CHART_BLUE

# Data labels
series.has_data_labels = True
series.data_labels.font.size = Pt(8)
series.data_labels.font.color.rgb = DARK_TEXT
series.data_labels.font.name = FONT_NAME
series.data_labels.number_format = '0'
series.data_labels.show_value = True

# Axes
style_axis(chart.category_axis, 9, MID_TEXT, has_gridlines=False)
style_axis(chart.value_axis, 8, MID_TEXT, has_gridlines=True, gridline_color=RGBColor(0xE0, 0xE0, 0xE0))

# Plot area background
plot = chart.plots[0]
plot.gap_width = 150

# Callout: 최근 2~3년 감소 추세
callout_bg = add_rounded_rect(slide, Inches(4.0), Inches(1.95), Inches(1.9), Inches(0.38),
                               RGBColor(0xFF, 0xF3, 0xE0), CHART_ORANGE)
add_textbox(slide, Inches(4.0), Inches(1.95), Inches(1.9), Inches(0.38),
            "최근 2~3년 감소 추세 ↓",
            font_size=10, bold=True, color=CHART_ORANGE, alignment=PP_ALIGN.CENTER)


# ============================================================
# 3. TOP-RIGHT: DOUGHNUT CHART - IPC 기술분야별 특허분포
# ============================================================
# Section title
add_textbox(slide, Inches(6.8), section_top, Inches(5.5), Inches(0.45),
            "IPC 기술분야별 특허분포 (566건)",
            font_size=15, bold=True, color=NAVY)

# Doughnut chart
donut_data = CategoryChartData()
donut_data.categories = ['C22C', 'H01F', 'C22F', 'G01N', 'C23C', 'B22F', '기타']
donut_data.add_series('건수', (124, 55, 54, 54, 40, 35, 204))

donut_frame = slide.shapes.add_chart(
    XL_CHART_TYPE.DOUGHNUT,
    Inches(6.8), chart_top, Inches(3.2), Inches(2.85),
    donut_data
)
donut_chart = donut_frame.chart
donut_chart.has_legend = False
donut_chart.has_title = False

# Color each slice
donut_colors = [CHART_BLUE, CHART_ORANGE, CHART_GREEN, CHART_YELLOW, CHART_PURPLE, CHART_TEAL, CHART_GRAY]
plot = donut_chart.plots[0]
series = plot.series[0]
for i, color in enumerate(donut_colors):
    pt = series.points[i]
    pt.format.fill.solid()
    pt.format.fill.fore_color.rgb = color

# Manual legend (right side of donut)
legend_items = [
    ("C22C (124건)", CHART_BLUE),
    ("H01F (55건)", CHART_ORANGE),
    ("C22F (54건)", CHART_GREEN),
    ("G01N (54건)", CHART_YELLOW),
    ("C23C (40건)", CHART_PURPLE),
    ("B22F (35건)", CHART_TEAL),
    ("기타 (204건)", CHART_GRAY),
]

legend_x = Inches(10.3)
for i, (label, color) in enumerate(legend_items):
    ly = Inches(2.0) + Inches(i * 0.36)
    # Color square
    add_rect(slide, legend_x, ly, Inches(0.22), Inches(0.22), color)
    # Label text
    add_textbox(slide, legend_x + Inches(0.32), ly - Inches(0.02), Inches(2.2), Inches(0.28),
                label, font_size=10, color=DARK_TEXT)


# ============================================================
# 4. DIVIDER LINE
# ============================================================
divider_y = Inches(4.85)
line = slide.shapes.add_shape(
    MSO_SHAPE.RECTANGLE,
    Inches(0.5), divider_y, Inches(12.3), Pt(1)
)
line.fill.solid()
line.fill.fore_color.rgb = RGBColor(0xDD, 0xDD, 0xDD)
line.line.fill.background()


# ============================================================
# 5. BOTTOM: BAR CHART - 연도별 기술이전 건수 및 기술료
# ============================================================
bottom_title_y = Inches(5.0)
bottom_chart_y = Inches(5.55)

# Section title
add_textbox(slide, Inches(0.5), bottom_title_y, Inches(5.5), Inches(0.45),
            "연도별 기술이전 건수 및 기술료",
            font_size=15, bold=True, color=NAVY)

# Manual legend
# 기술이전 건수
add_rect(slide, Inches(7.0), Inches(5.1), Inches(0.3), Inches(0.2), BAR_BLUE)
add_textbox(slide, Inches(7.4), Inches(5.05), Inches(1.4), Inches(0.3),
            "기술이전 건수", font_size=10, color=MID_TEXT)

# 기술료(백만원)
add_rect(slide, Inches(9.0), Inches(5.1), Inches(0.3), Inches(0.2), BAR_GOLD)
add_textbox(slide, Inches(9.4), Inches(5.05), Inches(1.5), Inches(0.3),
            "기술료(백만원)", font_size=10, color=MID_TEXT)

# Bar chart
bar_data = CategoryChartData()
bar_data.categories = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024']
bar_data.add_series('기술이전 건수', (58, 125, 78, 85, 95, 80, 88, 75, 82, 70))
bar_data.add_series('기술료(백만원)', (320, 980, 450, 520, 680, 510, 620, 480, 550, 420))

bar_frame = slide.shapes.add_chart(
    XL_CHART_TYPE.COLUMN_CLUSTERED,
    Inches(0.4), bottom_chart_y, Inches(12.3), Inches(1.65),
    bar_data
)
bar_chart = bar_frame.chart
bar_chart.has_legend = False
bar_chart.has_title = False

# Style bars
bar_series_0 = bar_chart.series[0]
bar_series_0.format.fill.solid()
bar_series_0.format.fill.fore_color.rgb = BAR_BLUE

bar_series_1 = bar_chart.series[1]
bar_series_1.format.fill.solid()
bar_series_1.format.fill.fore_color.rgb = BAR_GOLD

# Axes
style_axis(bar_chart.category_axis, 9, MID_TEXT, has_gridlines=False)
style_axis(bar_chart.value_axis, 8, MID_TEXT, has_gridlines=True, gridline_color=RGBColor(0xE0, 0xE0, 0xE0))

# Callout: 2016년 최고 실적
callout2 = add_rounded_rect(slide, Inches(1.8), Inches(5.45), Inches(1.6), Inches(0.32),
                             RGBColor(0xFF, 0xF8, 0xE1), BAR_GOLD)
add_textbox(slide, Inches(1.8), Inches(5.45), Inches(1.6), Inches(0.32),
            "2016년 최고 실적 ★",
            font_size=10, bold=True, color=RGBColor(0xB8, 0x86, 0x0B), alignment=PP_ALIGN.CENTER)


# ============================================================
# 6. FOOTER BAR
# ============================================================
footer_y = Inches(7.15)
footer_h = Inches(0.35)

add_rect(slide, Inches(0), footer_y, SW, footer_h, NAVY)
add_textbox(slide, Inches(0.5), footer_y, Inches(12.3), footer_h,
            "한국재료연구원(KIMS)  |  기술사업화 전략 보고서  |  2024",
            font_size=10, color=GOLD, alignment=PP_ALIGN.CENTER)


# ============================================================
# SAVE
# ============================================================
output_path = "/home/user/skills/output-kims-openxml.pptx"
prs.save(output_path)
print(f"✓ Created {output_path}")
print(f"  Slide size: {prs.slide_width / 914400:.1f}\" × {prs.slide_height / 914400:.1f}\"")
print(f"  Shapes: {len(slide.shapes)}")
