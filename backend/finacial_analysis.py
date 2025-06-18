import ssl
import certifi
from urllib.request import urlopen, Request
import json
import pandas as pd
import ssl
import certifi
import json
import pandas as pd
from urllib.request import urlopen, Request

def get_jsonparsed_data(url):
    """Fetch JSON data from a given URL using a secure context."""
    try:
        context = ssl.create_default_context(cafile=certifi.where())
        request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(request, context=context) as response:
            return json.load(response)
    except Exception as e:
        print(f"Error fetching data: {e}")
        return []

class Financial_Analysis:
    def __init__(self, ticker):
        self.ticker = ticker.upper()
        self.api_key = "JAZsASo8FabLwYfWAZo6wrO91B7Qx5tm"
        url = f"https://financialmodelingprep.com/api/v3/key-metrics/{self.ticker}?period=annual&apikey={self.api_key}"
        json_data = get_jsonparsed_data(url)

        if not json_data:
            raise ValueError("No data retrieved. Please check the ticker or API limits.")

        self.data = pd.DataFrame(json_data)
        self.latest = self.data.iloc[-1]  # Use latest once
        self.scores = {
            "Valuation": 0,
            "Profitability": 0,
            "Liquidity": 0,
            "Solvency": 0,
            "Efficiency": 0,
            "CashFlow": 0
        }

    def _score_metric(self, value, thresholds, scores):
        """Helper to return score based on value and thresholds."""
        for i, threshold in enumerate(thresholds):
            if value < threshold:
                return scores[i]
        return scores[-1]

    def Valuation_Analysis(self):
        latest = self.latest
        score = 0
        score += self._score_metric(latest.get('peRatio', 0), [15, 25], [3, 2, 1])
        score += self._score_metric(latest.get('pbRatio', 0), [1, 3], [3, 2, 1])
        score += self._score_metric(latest.get('priceToSalesRatio', 0), [1, 5], [3, 2, 1])
        score += self._score_metric(latest.get('pfcfRatio', 0), [10, 20], [3, 2, 1])
        score += self._score_metric(latest.get('earningsYield', 0), [0.03, 0.06], [1, 2, 3])
        score += self._score_metric(latest.get('freeCashFlowYield', 0), [0.02, 0.06], [1, 2, 3])
        self.scores["Valuation"] = score / 6
        return self.scores["Valuation"]

    def Profitability_Analysis(self):
        latest = self.latest
        score = 0
        score += self._score_metric(latest.get('roe', 0), [0.05, 0.15], [1, 2, 3])
        score += self._score_metric(latest.get('roic', 0), [0.05, 0.10], [1, 2, 3])
        score += self._score_metric(latest.get('returnOnTangibleAssets', 0), [0.03, 0.08], [1, 2, 3])
        score += 3 if latest.get('incomeQuality', 0) > 1 else 2
        self.scores["Profitability"] = score / 4
        return self.scores["Profitability"]

    def Liquidity_Analysis(self):
        cr = self.latest.get('currentRatio', 0)
        self.scores["Liquidity"] = self._score_metric(cr, [1, 1.5], [1, 2, 3])
        return self.scores["Liquidity"]

    def Solvency_Analysis(self):
        latest = self.latest
        score = 0
        score += self._score_metric(latest.get('debtToEquity', 1e6), [1], [3, 1.5])
        score += self._score_metric(latest.get('debtToAssets', 1e6), [0.5], [3, 1.5])
        score += self._score_metric(latest.get('netDebtToEBITDA', 1e6), [2, 4], [3, 2, 1])
        score += self._score_metric(latest.get('interestCoverage', 0), [1.5, 5], [1, 2, 3])
        self.scores["Solvency"] = score / 4
        return self.scores["Solvency"]

    def Efficiency_Analysis(self):
        latest = self.latest
        score = 0
        score += self._score_metric(latest.get('receivablesTurnover', 0), [5, 10], [1, 2, 3])
        score += self._score_metric(latest.get('payablesTurnover', 0), [4, 10], [1, 3, 2])
        score += self._score_metric(latest.get('inventoryTurnover', 0), [4, 8], [1, 2, 3])
        score += self._score_metric(latest.get('daysSalesOutstanding', 1e6), [60, 30], [1, 2, 3])
        score += self._score_metric(latest.get('daysPayablesOutstanding', 0), [30, 80], [1, 3, 2])
        score += self._score_metric(latest.get('daysOfInventoryOnHand', 1e6), [60, 30], [1, 2, 3])
        self.scores["Efficiency"] = score / 6
        return self.scores["Efficiency"]

    def Cash_Flow_Analysis(self):
        latest = self.latest
        score = 0
        score += self._score_metric(latest.get('pocfratio', 1e6), [10, 20], [3, 2, 1])
        score += self._score_metric(latest.get('capexToOperatingCashFlow', 1e6), [0.2, 0.5], [3, 2, 1])
        score += self._score_metric(latest.get('capexToRevenue', 1e6), [0.05, 0.15], [3, 2, 1])
        self.scores["CashFlow"] = score / 3
        return self.scores["CashFlow"]

    def Final_Score(self):
        """Compute overall average score."""
        self.Valuation_Analysis()
        self.Profitability_Analysis()
        self.Liquidity_Analysis()
        self.Solvency_Analysis()
        self.Efficiency_Analysis()
        self.Cash_Flow_Analysis()
        return round(sum(self.scores.values()) / len(self.scores), 2)

    def Investment_Rating(self):
        """Return investment recommendation based on score."""
        score = self.Final_Score()
        if score >= 2.5:
            return "Undervalued or Strong Buy"
        elif score >= 1.8:
            return "Fairly Valued or Hold"
        else:
            return "Overvalued or Avoid"
        
class MultiCompanyComparator:
    def __init__(self, tickers):
        self.tickers = [ticker.upper() for ticker in tickers]
        self.companies = {ticker: Financial_Analysis(ticker) for ticker in self.tickers}

    def compare_all(self):
        metric_data = {
            "Valuation Score": {},
            "Profitability Score": {},
            "Liquidity Score": {},
            "Solvency Score": {},
            "Efficiency Score": {},
            "Cash Flow Score": {},
            "Final Investment Score": {},
            "Investment Rating": {},
        }

        for ticker, analysis in self.companies.items():
            metric_data["Valuation Score"][ticker] = analysis.Valuation_Analysis()
            metric_data["Profitability Score"][ticker] = analysis.Profitability_Analysis()
            metric_data["Liquidity Score"][ticker] = analysis.Liquidity_Analysis()
            metric_data["Solvency Score"][ticker] = analysis.Solvency_Analysis()
            metric_data["Efficiency Score"][ticker] = analysis.Efficiency_Analysis()
            metric_data["Cash Flow Score"][ticker] = analysis.Cash_Flow_Analysis()
            metric_data["Final Investment Score"][ticker] = analysis.Final_Score()
            metric_data["Investment Rating"][ticker] = analysis.Investment_Rating()

        df = pd.DataFrame(metric_data).T
        return df

def get_jsonparsed_data(url):
    """Fetch JSON data from a given URL using a secure context."""
    try:
        context = ssl.create_default_context(cafile=certifi.where())
        request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(request, context=context) as response:
            return json.load(response)
    except Exception as e:
        print(f"Error fetching data: {e}")
        return []

class FinancialGrowth:
    def __init__(self, ticker):
        self.ticker = ticker
        self.api_key = "JAZsASo8FabLwYfWAZo6wrO91B7Qx5tm"
        self.cash_flow = pd.DataFrame(get_jsonparsed_data(
            f"https://financialmodelingprep.com/api/v3/cash-flow-statement-growth/{self.ticker}?period=annual&apikey={self.api_key}"
        ))
        self.income_stmt = pd.DataFrame(get_jsonparsed_data(
            f"https://financialmodelingprep.com/api/v3/income-statement-growth/{self.ticker}?period=annual&apikey={self.api_key}"
        ))
        self.balance_sheet = pd.DataFrame(get_jsonparsed_data(
            f"https://financialmodelingprep.com/api/v3/balance-sheet-statement-growth/{self.ticker}?period=annual&apikey={self.api_key}"
        ))
        self.financial_growth = pd.DataFrame(get_jsonparsed_data(
            f"https://financialmodelingprep.com/api/v3/financial-growth/{self.ticker}?period=annual&apikey={self.api_key}"
        ))

    def final_cashflow_analysis(self, show_trend_summary=False):
        df = self.cash_flow[self.cash_flow['symbol'] == self.ticker].sort_values(by='calendarYear')
        metrics = {
            "OCF/Net Income": [], "Free Cash Flow Margin": [], "Net Cash Change": [],
            "CAPEX/OCF": [], "Debt Repayment/OCF": [], "Dividends/OCF": [],
            "SBC/OCF": [], "D&A/OCF": [], "WC Change/OCF": [], "Acquisitions/OCF": [],
            "Buybacks/OCF": [], "Investing Outflow/OCF": [], "Financing Flow/OCF": []
        }
        years = []
        for _, row in df.iterrows():
            try:
                year = row['calendarYear']
                ocf = row['growthNetCashProvidedByOperatingActivites']
                fcf = row['growthFreeCashFlow']
                ni = row['growthNetIncome']
                capex = row['growthCapitalExpenditure']
                debt_repay = row['growthDebtRepayment']
                div_paid = row['growthDividendsPaid']
                sbc = row['growthStockBasedCompensation']
                da = row['growthDepreciationAndAmortization']
                wc_change = row['growthChangeInWorkingCapital']
                net_cash = row['growthNetChangeInCash']
                acquisitions = row['growthAcquisitionsNet']
                repurchase = row['growthCommonStockRepurchased']
                invest_cf = row['growthNetCashUsedForInvestingActivites']
                finance_cf = row['growthNetCashUsedProvidedByFinancingActivities']
                years.append(year)

                metrics["OCF/Net Income"].append(ocf / ni if ni else 0)
                metrics["Free Cash Flow Margin"].append(fcf / ocf if ocf else 0)
                metrics["Net Cash Change"].append(net_cash)
                metrics["CAPEX/OCF"].append(capex / ocf if ocf else 0)
                metrics["Debt Repayment/OCF"].append(debt_repay / ocf if ocf else 0)
                metrics["Dividends/OCF"].append(div_paid / ocf if ocf else 0)
                metrics["SBC/OCF"].append(sbc / ocf if ocf else 0)
                metrics["D&A/OCF"].append(da / ocf if ocf else 0)
                metrics["WC Change/OCF"].append(wc_change / ocf if ocf else 0)
                metrics["Acquisitions/OCF"].append(acquisitions / ocf if ocf else 0)
                metrics["Buybacks/OCF"].append(repurchase / ocf if ocf else 0)
                metrics["Investing Outflow/OCF"].append(invest_cf / ocf if ocf else 0)
                metrics["Financing Flow/OCF"].append(finance_cf / ocf if ocf else 0)
            except:
                continue

        result_df = pd.DataFrame({'Year': years})
        for metric, values in metrics.items():
            result_df[metric] = [round(v, 2) for v in values]

        def score_metric(values):
            if len(values) < 4:
                return 1
            recent = values[-4:]
            if all(x > y for x, y in zip(recent, recent[1:])):
                return 0
            elif all(x < y for x, y in zip(recent, recent[1:])):
                return 2
            else:
                return 1

        total_score, max_score = 0, 0
        if show_trend_summary:
            print(f"\nTrend Summary & Scoring (Last 4 Years) for {self.ticker}:")
            print("-" * 100)
        for metric, values in metrics.items():
            score = score_metric(values)
            total_score += score
            max_score += 2
            if show_trend_summary:
                trend_type = "Decreasing" if score == 0 else "Increasing" if score == 2 else "Mixed/Stable"
                print(f"{metric.ljust(30)} | Trend: {trend_type.ljust(15)} | Score: {score}")

        quality_score = round((total_score / max_score) * 100, 2)
        print(f"\nFinal Cash Flow Quality Score for {self.ticker}: {quality_score} / 100")
        print("-" * 100)
        if quality_score >= 75:
            print("Strong: Company shows consistent positive trends in cash flow metrics.")
        elif quality_score >= 50:
            print("Moderate: Mixed trends; cash flow health is decent but watch for weaknesses.")
        else:
            print("Weak: Negative trends dominate; cash flow may be deteriorating or unstable.")
        return quality_score

    def final_income_analysis(self, show_trend_summary=False):
        df = self.income_stmt[self.income_stmt['symbol'] == self.ticker].sort_values(by='calendarYear')
        metrics = {
            "Revenue Growth": [], "Gross Profit Growth": [], "Operating Income Growth": [],
            "EBITDA Growth": [], "Net Income Growth": [], "EPS Growth": [],
            "Operating Margin": [], "Net Income Margin": [], "EBITDA Margin": []
        }
        years = []
        for _, row in df.iterrows():
            try:
                year = row['calendarYear']
                revenue = row['growthRevenue']
                gross_profit = row['growthGrossProfit']
                operating_income = row['growthOperatingIncome']
                ebitda = row['growthEBITDA']
                net_income = row['growthNetIncome']
                eps = row['growthEPS']
                years.append(year)

                metrics["Revenue Growth"].append(revenue)
                metrics["Gross Profit Growth"].append(gross_profit)
                metrics["Operating Income Growth"].append(operating_income)
                metrics["EBITDA Growth"].append(ebitda)
                metrics["Net Income Growth"].append(net_income)
                metrics["EPS Growth"].append(eps)
                metrics["Operating Margin"].append(operating_income / revenue if revenue else 0)
                metrics["Net Income Margin"].append(net_income / revenue if revenue else 0)
                metrics["EBITDA Margin"].append(ebitda / revenue if revenue else 0)
            except Exception as e:
                print(f"Error processing row for year {row.get('calendarYear', 'unknown')}: {e}")
                continue

        result_df = pd.DataFrame({'Year': years})
        for metric, values in metrics.items():
            result_df[metric] = [round(v, 2) for v in values]

        def score_metric(values):
            if len(values) < 4:
                return 1
            recent = values[-4:]
            if all(x > y for x, y in zip(recent, recent[1:])):
                return 0
            elif all(x < y for x, y in zip(recent, recent[1:])):
                return 2
            else:
                return 1

        total_score, max_score = 0, 0
        if show_trend_summary:
            print(f"\nTrend Summary & Scoring (Last 4 Years) for {self.ticker}:")
            print("-" * 100)
        for metric, values in metrics.items():
            score = score_metric(values)
            total_score += score
            max_score += 2
            if show_trend_summary:
                trend_type = "Decreasing" if score == 0 else "Increasing" if score == 2 else "Mixed/Stable"
                print(f"{metric.ljust(30)} | Trend: {trend_type.ljust(15)} | Score: {score}")

        quality_score = round((total_score / max_score) * 100, 2)
        print(f"\nFinal Income Quality Score for {self.ticker}: {quality_score} / 100")
        print("-" * 100)
        if quality_score >= 75:
            print("Strong: Company shows consistent positive trends in income statement metrics.")
        elif quality_score >= 50:
            print("Moderate: Mixed trends; income statement health is decent but watch for weaknesses.")
        else:
            print("Weak: Negative trends dominate; income statement may be deteriorating or unstable.")
        return quality_score
    
    def final_balance_sheet_analysis(self, show_trend_summary=False):
        df = self.balance_sheet[self.balance_sheet['symbol'] == self.ticker].sort_values(by='calendarYear')
        metrics = {
            "Total Assets Growth": [], "Total Liabilities Growth": [], "Total Equity Growth": [],
            "Current Assets Growth": [], "Current Liabilities Growth": [],
            "Cash & Equivalents Growth": [], "Net Debt Growth": [],
            "Inventory Growth": [], "Accounts Receivable Growth": [],
        }
        years = []
        for _, row in df.iterrows():
            try:
                year = row['calendarYear']
                years.append(year)
                metrics["Total Assets Growth"].append(row.get('growthTotalAssets', 0))
                metrics["Total Liabilities Growth"].append(row.get('growthTotalLiabilities', 0))
                metrics["Total Equity Growth"].append(row.get('growthTotalEquity', 0))
                metrics["Current Assets Growth"].append(row.get('growthTotalCurrentAssets', 0))
                metrics["Current Liabilities Growth"].append(row.get('growthTotalCurrentLiabilities', 0))
                metrics["Cash & Equivalents Growth"].append(row.get('growthCashAndCashEquivalents', 0))
                metrics["Net Debt Growth"].append(row.get('growthNetDebt', 0))
                metrics["Inventory Growth"].append(row.get('growthInventory', 0))
                metrics["Accounts Receivable Growth"].append(row.get('growthAccountsReceivable', 0))
            except Exception as e:
                print(f"Error processing row for year {row.get('calendarYear', 'unknown')}: {e}")
                continue

        result_df = pd.DataFrame({'Year': years})
        for metric, values in metrics.items():
            result_df[metric] = [round(v, 2) for v in values]

        def score_metric(values):
            if len(values) < 4:
                return 1
            recent = values[-4:]
            if all(x > y for x, y in zip(recent, recent[1:])):
                return 0
            elif all(x < y for x, y in zip(recent, recent[1:])):
                return 2
            else:
                return 1

        total_score, max_score = 0, 0
        if show_trend_summary:
            print(f"\nTrend Summary & Scoring (Last 4 Years) for {self.ticker}:")
            print("-" * 100)
        for metric, values in metrics.items():
            score = score_metric(values)
            total_score += score
            max_score += 2
            if show_trend_summary:
                trend_type = "Decreasing" if score == 0 else "Increasing" if score == 2 else "Mixed/Stable"
                print(f"{metric.ljust(30)} | Trend: {trend_type.ljust(15)} | Score: {score}")

        quality_score = round((total_score / max_score) * 100, 2)
        print(f"\nFinal Balance Sheet Quality Score for {self.ticker}: {quality_score} / 100")
        print("-" * 100)
        if quality_score >= 75:
            print("Strong: Company shows consistent positive trends in balance sheet metrics.")
        elif quality_score >= 50:
            print("Moderate: Mixed trends; balance sheet health is decent but worth monitoring.")
        else:
            print("Weak: Negative trends dominate; financial position may be weakening.")
        return quality_score

    
    def analyze_financial_growth(self):
        df_symbol = self.financial_growth[self.financial_growth['symbol'] == self.ticker].sort_values('calendarYear')
        if df_symbol.empty:
            return f"No data available for symbol: {self.ticker}"

        growth_metrics = {
            'Revenue & Profit': ['revenueGrowth', 'grossProfitGrowth', 'ebitgrowth', 'operatingIncomeGrowth', 'netIncomeGrowth'],
            'Earnings': ['epsgrowth', 'epsdilutedGrowth'],
            'Cash Flow': ['operatingCashFlowGrowth', 'freeCashFlowGrowth'],
            'Shareholder Value': ['bookValueperShareGrowth', 'dividendsperShareGrowth'],
            'Per Share Long-Term': [
                'tenYRevenueGrowthPerShare', 'fiveYRevenueGrowthPerShare', 'threeYRevenueGrowthPerShare',
                'tenYOperatingCFGrowthPerShare', 'fiveYOperatingCFGrowthPerShare', 'threeYOperatingCFGrowthPerShare',
                'tenYNetIncomeGrowthPerShare', 'fiveYNetIncomeGrowthPerShare', 'threeYNetIncomeGrowthPerShare',
                'tenYShareholdersEquityGrowthPerShare', 'fiveYShareholdersEquityGrowthPerShare', 'threeYShareholdersEquityGrowthPerShare',
                'tenYDividendperShareGrowthPerShare', 'fiveYDividendperShareGrowthPerShare', 'threeYDividendperShareGrowthPerShare'
            ],
            'Efficiency': ['rdexpenseGrowth', 'sgaexpensesGrowth']
        }

        total_score = 0
        max_score = 0
        category_scores = {}

        for category, metrics in growth_metrics.items():
            score = 0
            count = 0
            for metric in metrics:
                if metric in df_symbol.columns:
                    values = df_symbol[metric].dropna().astype(float)
                    if not values.empty:
                        avg_growth = values.mean()
                        if 'expense' in metric.lower():
                            if avg_growth <= 0:
                                score += 2
                            elif avg_growth < 5:
                                score += 1
                        else:
                            if avg_growth > 15:
                                score += 2
                            elif avg_growth > 0:
                                score += 1
                        count += 2  # Each metric has a max score of 2
            if count > 0:
                category_scores[category] = round((score / count) * 100, 2)
                total_score += score
                max_score += count

        final_score = round((total_score / max_score) * 100, 2) if max_score > 0 else 0

        if final_score > 70:
            interpretation = "Strong: Consistently growing across most areas."
        elif final_score > 50:
            interpretation = "Moderate: Some strong growth, some weak or inconsistent trends."
        else:
            interpretation = "Weak: Many areas with poor or negative growth trends."

        return {
            "symbol": self.ticker,
            "Financial Growth Score": f"{final_score} / 100",
            "Interpretation": interpretation,
            "Category Breakdown (%)": category_scores
        }
