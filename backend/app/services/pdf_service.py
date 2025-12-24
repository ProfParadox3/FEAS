import os
from datetime import datetime
from pathlib import Path
from jinja2 import Environment, FileSystemLoader, select_autoescape
from playwright.async_api import async_playwright
from app.core.config import settings

TEMPLATE_DIR = Path(__file__).resolve().parent / "templates"
env = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(["html", "xml"]) 
)

async def render_html(template_name: str, context: dict) -> str:
    template = env.get_template(template_name)
    return template.render(**context)

async def generate_pdf_from_html(html_content: str, output_path: str, format_: str = "A4"):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_content(html_content, wait_until="networkidle")
        await page.pdf(
            path=output_path,
            format=format_,
            print_background=True,
            margin={"top": "20mm", "bottom": "20mm", "left": "15mm", "right": "15mm"},
            display_header_footer=True,
            header_template="<div style='font-size:10px;color:#666;width:100%;text-align:right;padding-right:10mm;'>FEAS Report</div>",
            footer_template="<div style='font-size:10px;color:#666;width:100%;text-align:right;padding-right:10mm;'>Page <span class='pageNumber'></span> of <span class='totalPages'></span></div>",
        )
        await browser.close()

async def generate_report(payload: dict) -> str:
    report_id = payload.get("report_id") or datetime.utcnow().strftime("%Y%m%d%H%M%S")
    title = payload.get("title", "Forensics Report")
    sections = payload.get("sections", [])
    orientation = payload.get("orientation", "portrait")

    html = await render_html(
        "report.html",
        {
            "title": title,
            "sections": sections,
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "orientation": orientation,
        }
    )

    reports_dir = os.path.abspath(getattr(settings, "REPORTS_DIR", "reports"))
    os.makedirs(reports_dir, exist_ok=True)
    output_path = os.path.join(reports_dir, f"{report_id}.pdf")
    await generate_pdf_from_html(html, output_path)
    return output_path