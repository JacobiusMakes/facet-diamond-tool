"""Build the true-size Facet diamond comparison sheet."""

from math import pow
from pathlib import Path

from reportlab.graphics import renderPDF
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "facet-diamond-size-chart.pdf"
FACET_URL = "https://jacobiusmakes.github.io/facet-diamond-tool/?via=print"

INK = HexColor("#091D2E")
BLUE = HexColor("#173F70")
LINE = HexColor("#6F86A8")
PAPER = HexColor("#F8F5EF")
FILL = HexColor("#E7EEF6")
MUTED = HexColor("#6D675F")
GREEN = HexColor("#2E624B")

CARATS = (1.0, 1.5, 2.0, 2.5, 3.0)
SHAPES = (
    ("Round", 6.5, 6.5, "round"),
    ("Oval", 8.0, 5.5, "oval"),
    ("Emerald", 7.0, 5.0, "emerald"),
    ("Dutch Marquise", 9.0, 5.0, "dutch_marquise"),
)


def scaled(length_mm, width_mm, carat):
    factor = pow(carat, 1.0 / 3.0)
    return length_mm * factor, width_mm * factor


def polygon_points(cx, cy, length, width, kind):
    left, right = cx - length / 2, cx + length / 2
    bottom, top = cy - width / 2, cy + width / 2
    if kind == "emerald":
        bevel = min(length, width) * 0.17
        return [
            (left + bevel, bottom), (right - bevel, bottom),
            (right, bottom + bevel), (right, top - bevel),
            (right - bevel, top), (left + bevel, top),
            (left, top - bevel), (left, bottom + bevel),
        ]
    shoulder = length * 0.22
    return [
        (left, cy), (left + shoulder, bottom), (right - shoulder, bottom),
        (right, cy), (right - shoulder, top), (left + shoulder, top),
    ]


def draw_shape(pdf, cx, cy, length_mm, width_mm, kind):
    length, width = length_mm * mm, width_mm * mm
    pdf.saveState()
    pdf.setLineWidth(0.7)
    pdf.setStrokeColor(LINE)
    pdf.setFillColor(FILL)
    if kind == "round":
        pdf.circle(cx, cy, width / 2, stroke=1, fill=1)
    elif kind == "oval":
        pdf.ellipse(cx - length / 2, cy - width / 2, cx + length / 2, cy + width / 2, stroke=1, fill=1)
    else:
        points = polygon_points(cx, cy, length, width, kind)
        path = pdf.beginPath()
        path.moveTo(*points[0])
        for point in points[1:]:
            path.lineTo(*point)
        path.close()
        pdf.drawPath(path, stroke=1, fill=1)
    pdf.setStrokeColor(Color(1, 1, 1, alpha=0.8))
    pdf.setLineWidth(0.35)
    pdf.line(cx - length * 0.34, cy, cx + length * 0.34, cy)
    pdf.restoreState()


def draw_qr(pdf, value, x, y, size):
    widget = qr.QrCodeWidget(value)
    x1, y1, x2, y2 = widget.getBounds()
    drawing = Drawing(size, size, transform=[size / (x2 - x1), 0, 0, size / (y2 - y1), 0, 0])
    drawing.add(widget)
    renderPDF.draw(drawing, pdf, x, y)


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    width, height = landscape(letter)
    pdf = canvas.Canvas(str(OUT), pagesize=(width, height), pageCompression=1)
    pdf.setTitle("Facet true-size diamond comparison sheet")
    pdf.setAuthor("Stienhardt & Stones")
    pdf.setSubject("Printable face-up size comparisons for round, oval, emerald, and Dutch Marquise diamonds")
    pdf.setKeywords("diamond size chart, printable diamond comparison, carat size, face-up millimeters")

    pdf.setFillColor(PAPER)
    pdf.rect(0, 0, width, height, stroke=0, fill=1)

    margin = 15 * mm
    pdf.setFillColor(GREEN)
    pdf.setFont("Helvetica-Bold", 7.5)
    pdf.drawString(margin, height - 16 * mm, "PRINTABLE DIAMOND SIZE CHECK")
    pdf.setFillColor(INK)
    pdf.setFont("Times-Roman", 28)
    pdf.drawString(margin, height - 27 * mm, "See the millimeters carat weight hides.")
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 8.3)
    pdf.drawString(margin, height - 34 * mm, "Print at Actual Size or 100%. Measure the calibration line before comparing anything on your hand.")

    calibration_x = width - margin - 50 * mm
    calibration_y = height - 25 * mm
    pdf.setStrokeColor(INK)
    pdf.setLineWidth(0.8)
    pdf.line(calibration_x, calibration_y, calibration_x + 50 * mm, calibration_y)
    pdf.line(calibration_x, calibration_y - 2.2 * mm, calibration_x, calibration_y + 2.2 * mm)
    pdf.line(calibration_x + 50 * mm, calibration_y - 2.2 * mm, calibration_x + 50 * mm, calibration_y + 2.2 * mm)
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 7)
    pdf.drawCentredString(calibration_x + 25 * mm, calibration_y + 3 * mm, "THIS LINE MUST MEASURE 50 MM")
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 6.8)
    pdf.drawCentredString(calibration_x + 25 * mm, calibration_y - 5 * mm, "If it does not, change the printer scaling and print again.")

    table_top = height - 49 * mm
    label_width = 38 * mm
    table_left = margin
    usable_width = width - (2 * margin) - label_width
    cell_width = usable_width / len(CARATS)
    row_height = 27 * mm

    pdf.setStrokeColor(HexColor("#D9D1C4"))
    pdf.setLineWidth(0.45)
    pdf.line(table_left, table_top, width - margin, table_top)

    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica-Bold", 7)
    for index, carat in enumerate(CARATS):
        cx = table_left + label_width + (index + 0.5) * cell_width
        pdf.drawCentredString(cx, table_top + 3.4 * mm, f"{carat:.1f} CT")

    for row_index, (label, anchor_length, anchor_width, kind) in enumerate(SHAPES):
        y_top = table_top - row_index * row_height
        cy = y_top - row_height * 0.5
        pdf.setFillColor(INK)
        pdf.setFont("Times-Roman", 13)
        pdf.drawString(table_left, cy + 2.2 * mm, label)
        pdf.setFillColor(MUTED)
        pdf.setFont("Helvetica", 6.5)
        pdf.drawString(table_left, cy - 2.5 * mm, f"1 ct anchor: {anchor_length:.1f} x {anchor_width:.1f} mm")
        for column_index, carat in enumerate(CARATS):
            cx = table_left + label_width + (column_index + 0.5) * cell_width
            length, stone_width = scaled(anchor_length, anchor_width, carat)
            draw_shape(pdf, cx, cy + 2.5 * mm, length, stone_width, kind)
            pdf.setFillColor(MUTED)
            pdf.setFont("Helvetica", 6.1)
            pdf.drawCentredString(cx, cy - 8.1 * mm, f"{length:.1f} x {stone_width:.1f} mm")
        pdf.setStrokeColor(HexColor("#D9D1C4"))
        pdf.line(table_left, y_top - row_height, width - margin, y_top - row_height)

    bottom_y = 12 * mm
    qr_size = 22 * mm
    draw_qr(pdf, FACET_URL, width - margin - qr_size, bottom_y, qr_size)
    text_right = width - margin - qr_size - 5 * mm

    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 7.2)
    pdf.drawRightString(text_right, bottom_y + 17 * mm, "SCAN TO CHECK ANY SHAPE AND CARAT")
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 6.5)
    pdf.drawRightString(text_right, bottom_y + 12.5 * mm, "Facet is private by default. No listing URL or report number is collected.")
    pdf.drawRightString(text_right, bottom_y + 8.5 * mm, "The scan opens the printable-chart attribution path in Facet.")

    pdf.setFillColor(INK)
    pdf.setFont("Times-Roman", 9)
    pdf.drawString(margin, bottom_y + 17 * mm, "How to use it")
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 6.7)
    pdf.drawString(margin, bottom_y + 12.5 * mm, "1. Verify the 50 mm line.  2. Compare outlines at true size.  3. Check the exact stone measurements on its grading report.")
    pdf.drawString(margin, bottom_y + 8.5 * mm, "Method: vetted one-carat anchors scaled by the cube root of carat weight. Source reviewed July 10, 2026.")
    pdf.drawString(margin, bottom_y + 4.5 * mm, "Approximate typical proportions, not an appraisal. Stienhardt & Stones, New York City. Rings are hand-set and finished in NYC.")

    pdf.showPage()
    pdf.save()
    print(OUT)


if __name__ == "__main__":
    build()
