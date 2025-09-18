import os
import pandas as pd
import google.generativeai as genai
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    RunReportRequest,
    Dimension,
    Metric,
    DateRange,
)

# --- 1. AUTHENTICATION & SETUP ---
# Service account credentials for Google Analytics
credentials_json = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON")
with open("service_account.json", "w") as f:
    f.write(credentials_json)
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "service_account.json"

# Configure Gemini API client
gemini_api_key = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=gemini_api_key)

property_id = os.environ.get("GA_PROPERTY_ID")
ga_client = BetaAnalyticsDataClient()


# --- 2. FETCH DATA FROM GOOGLE ANALYTICS (FOR THE LAST MONTH) ---
def get_ga_data():
    """Fetches GA4 data for the last 30 days."""
    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="pagePath")],
        metrics=[
            Metric(name="activeUsers"),
            Metric(name="engagementRate"),
            Metric(name="averageSessionDuration"),
        ],
        date_ranges=[DateRange(start_date="30daysAgo", end_date="today")],
        limit=30,  # Get top 30 pages for a monthly review
    )
    response = ga_client.run_report(request)

    # Convert the GA response to a clean Pandas DataFrame
    records = []
    for row in response.rows:
        records.append(
            {
                "page": row.dimension_values[0].value,
                "users": int(row.metric_values[0].value),
                "engagement_rate": f"{float(row.metric_values[1].value) * 100:.2f}%",
                "avg_duration_sec": f"{float(row.metric_values[2].value):.2f}",
            }
        )
    return pd.DataFrame(records)


# --- 3. ANALYZE DATA WITH THE GEMINI MODEL ---
def analyze_data_with_gemini(df):
    """Uses Gemini to analyze the GA data and generate a report."""
    # Convert DataFrame to a string format the AI can easily parse
    data_csv = df.to_csv(index=False)

    prompt = f"""
    You are a data analyst and technical writing expert for Weaviate, a vector database company.
    Your task is to analyze the monthly performance report for our documentation site.

    Based on the following data from the last 30 days, please provide a concise report.
    The data includes the page path, number of active users, engagement rate, and average session duration in seconds.

    **Data:**
    ```csv
    {data_csv}
    ```

    **Your Report should include:**
    1.  **Executive Summary:** A one-paragraph overview of this month's performance.
    2.  **📈 Top 5 Performing Pages:** Identify the top 5 pages based on a healthy mix of high user count and strong engagement. Explain *why* you think they are succeeding.
    3.  **📉 Pages Needing Attention:** Identify 3-5 pages with low engagement rates or very low average session duration, especially if they have a decent number of users. These might be confusing or unhelpful.
    4.  **💡 Actionable Recommendations:** Based on the pages needing attention, provide specific, actionable suggestions. For example: "The page '/docs/core-concepts/schema' has many users but a low engagement rate. Recommendation: Add a visual diagram of a schema or a short video to improve clarity."

    Format your entire output in GitHub-flavored Markdown.
    """

    model = genai.GenerativeModel("gemini-pro")
    response = model.generate_content(prompt)
    return response.text


# --- MAIN EXECUTION ---
if __name__ == "__main__":
    ga_data = get_ga_data()
    # Filter out irrelevant pages if necessary
    if not ga_data.empty:
        ga_data = ga_data[~ga_data["page"].str.contains("/_app/")]

    if not ga_data.empty:
        report = analyze_data_with_gemini(ga_data)
        print(
            report
        )  # This print statement sends the report to the GitHub Action output
    else:
        print(
            "## Monthly Docs Performance Report\n\nNo data received from Google Analytics for the past month."
        )
