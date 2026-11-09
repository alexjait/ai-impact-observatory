from __future__ import annotations

import csv
from pathlib import Path


INPUT_PATH = Path("docs/seed_portal_impacto_ia_bilingue_completo_final.csv")
OUTPUT_PATH = Path("docs/seed_portal_impacto_ia_bilingue_completo_final_actividad_neutra.csv")


ES_GRANULARITY = {
    "tarea": "Tarea concreta de trabajo relacionada con {title} en {industry}{category}.",
    "funcion": "Función de trabajo relacionada con {title} en {industry}{category}.",
    "rol": "Rol de trabajo relacionado con {title} en {industry}{category}.",
    "profesion": "Profesión o campo de trabajo relacionado con {title} en {industry}{category}.",
}

EN_GRANULARITY = {
    "tarea": "Concrete work task related to {title} in {industry}{category}.",
    "funcion": "Work function related to {title} in {industry}{category}.",
    "rol": "Work role related to {title} in {industry}{category}.",
    "profesion": "Profession or field of work related to {title} in {industry}{category}.",
}


def first_label(raw: str) -> str | None:
    if not raw:
        return None
    return next((part.strip() for part in raw.split("|") if part.strip()), None)


def neutral_short_description(
    title: str,
    granularity: str,
    industry_name: str | None,
    category_name: str | None,
    locale: str,
) -> str:
    industry = industry_name or ("su sector correspondiente" if locale == "es" else "its corresponding sector")
    if category_name:
        category = (
            f", dentro de {category_name}" if locale == "es" else f", within {category_name}"
        )
    else:
        category = ""

    template = (ES_GRANULARITY if locale == "es" else EN_GRANULARITY).get(
        granularity,
        (
            "Actividad de trabajo relacionada con {title} en {industry}{category}."
            if locale == "es"
            else "Work activity related to {title} in {industry}{category}."
        ),
    )
    return template.format(
        title=title.strip(),
        industry=industry.strip(),
        category=category,
    )


def transform_row(row: dict[str, str]) -> dict[str, str]:
    industry_es = first_label(row.get("industry_names_es", ""))
    industry_en = first_label(row.get("industry_names_en", ""))
    category_es = first_label(row.get("category_names_es", ""))
    category_en = first_label(row.get("category_names_en", ""))

    short_es = neutral_short_description(
        row.get("title_es", ""),
        row.get("granularity", ""),
        industry_es,
        category_es,
        "es",
    )
    short_en = neutral_short_description(
        row.get("title_en", ""),
        row.get("granularity", ""),
        industry_en,
        category_en,
        "en",
    )

    row["short_description_es"] = short_es
    row["short_description_en"] = short_en
    row["full_description_es"] = ""
    row["full_description_en"] = ""
    row["editorial_summary_es"] = ""
    row["editorial_summary_en"] = ""
    row["seo_description_es"] = short_es
    row["seo_description_en"] = short_en
    return row


def main() -> None:
    with INPUT_PATH.open("r", encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source, delimiter=";")
        fieldnames = reader.fieldnames
        if not fieldnames:
            raise RuntimeError("Input CSV has no header.")
        rows = [transform_row(dict(row)) for row in reader]

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", encoding="utf-8-sig", newline="") as target:
        writer = csv.DictWriter(
            target,
            fieldnames=fieldnames,
            delimiter=";",
            quoting=csv.QUOTE_MINIMAL,
        )
        writer.writeheader()
        writer.writerows(rows)

    print(f"Generated {len(rows)} rows at {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
