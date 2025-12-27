import pandas as pd
import numpy as np

required_columns = [
    "ID",
    "age",
    "gender",
    "Durationofdiabetes",
    "Hypertension",
    "HBA",
    "HB",
    "DR_OD",
    "DR_SEVERITY_OD",
    "DR_OS",
    "DR_SEVERITY_OS",
    "EGFR",
]


def encode_clinical_features(df):
    age_conditions = [
        df["age"] < 40,
        df["age"] == 40,
        (df["age"] > 40) & (df["age"] <= 45),
        (df["age"] > 45) & (df["age"] <= 50),
        (df["age"] > 50) & (df["age"] <= 55),
        (df["age"] > 55) & (df["age"] <= 60),
        (df["age"] > 60) & (df["age"] <= 65),
        (df["age"] > 65) & (df["age"] <= 70),
        (df["age"] > 70) & (df["age"] <= 75),
        (df["age"] > 75) & (df["age"] <= 78),
        df["age"] > 78,
    ]
    age_values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    dd_conditions = [
        df["Durationofdiabetes"] <= 5,
        (df["Durationofdiabetes"] > 5) & (df["Durationofdiabetes"] <= 10),
        (df["Durationofdiabetes"] > 10) & (df["Durationofdiabetes"] <= 15),
        (df["Durationofdiabetes"] > 15) & (df["Durationofdiabetes"] <= 20),
        (df["Durationofdiabetes"] > 20) & (df["Durationofdiabetes"] <= 25),
        (df["Durationofdiabetes"] > 25) & (df["Durationofdiabetes"] <= 30),
        (df["Durationofdiabetes"] > 30) & (df["Durationofdiabetes"] <= 35),
        (df["Durationofdiabetes"] > 35) & (df["Durationofdiabetes"] <= 40),
        df["Durationofdiabetes"] > 40,
    ]
    dd_values = [1, 2, 3, 4, 5, 6, 7, 8, 9]

    hb_conditions = [
        df["HB"] <= 9,
        (df["HB"] > 9) & (df["HB"] <= 12),
        (df["HB"] > 12) & (df["HB"] <= 15),
        (df["HB"] > 15) & (df["HB"] <= 18),
        df["HB"] > 18,
    ]
    hb_values = [1, 2, 3, 4, 5]

    hba_conditions = [
        df["HBA"] <= 5,
        (df["HBA"] > 5) & (df["HBA"] <= 10),
        (df["HBA"] > 10) & (df["HBA"] <= 15),
        df["HBA"] > 15,
    ]
    hba_values = [1, 2, 3, 4]

    egfr_conditions = [df["EGFR"] >= 90, df["EGFR"] < 90]
    egfr_values = [0, 1]

    df["age"] = np.select(age_conditions, age_values)
    df["Durationofdiabetes"] = np.select(dd_conditions, dd_values)
    df["HB"] = np.select(hb_conditions, hb_values)
    df["HBA"] = np.select(hba_conditions, hba_values)
    df["EGFR"] = np.select(egfr_conditions, egfr_values)

    return df


def preprocess_excel_data(df):
    """
    Process Excel data and return as list of records.

    Args:
        df: Pandas DataFrame from Excel file

    Returns:
        List of dictionaries representing processed rows

    Raises:
        ValueError: If required columns are missing
    """
    # Check required columns
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")

    # Reindex to required columns
    df = df.reindex(columns=required_columns)

    # Apply feature encoding
    df = encode_clinical_features(df)

    # Convert to records
    rows = df.to_dict(orient="records")
    return rows
