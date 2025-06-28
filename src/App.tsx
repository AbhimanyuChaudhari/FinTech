import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Stocks from "./pages/Stocks";
import StockDetailPage from "./pages/StockDetailPage";
import Navbar from "./components/Navbar";
import FinancialAnalysisPage from "./pages/FinancialAnalysisPage";
import TechnicalAnalysisPage from "./pages/TechnicalAnalysisPage";
import SentimentAnalysisPage from "./pages/SentimentAnalysisPage";
import StatisticalAnalysisPage from "./pages/StatisticalAnalysisPage";
import StrategyTestingPage from "./pages/StrategyTestingPage";
import RiskAnalysisPage from "./pages/RiskAnalysisPage";
import WatchlistPage from "./pages/WatchlistPage";
import OptionsPage from "./pages/Options";
import OptionStrategyPage from "./pages/OptionStratPage";
import ARModelForecastPage from "./pages/ArModelPage";
import MAForecastPage from "./pages/MaModel";
import ARMAForecastPage from "./pages/armaModel";
import ARIMAForecastPage from "./pages/arimaModel";
import SARIMAForecastPage from "./pages/sarimaModel";
import ARIMAXForecastPage from "./pages/arimaxModel";
import VARForecastPage from "./pages/varModel";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/stock/:ticker" element={<StockDetailPage />} />
          <Route path="/stock/:ticker/financial" element={<FinancialAnalysisPage />} />
          <Route path="/stock/:ticker/sentiment" element={<SentimentAnalysisPage />} />
          <Route path="/stock/:ticker/technical" element={<TechnicalAnalysisPage />} />
          <Route path="/stock/:ticker/strategy" element={<StrategyTestingPage />} />
          <Route path="/stock/:ticker/statistical" element={<StatisticalAnalysisPage />} />
          <Route path="/stock/:ticker/technical" element={<TechnicalAnalysisPage />} />
          <Route path="/stock/:ticker/risk" element={<RiskAnalysisPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/options" element={<OptionsPage />} />
          <Route path="/strategy-builder" element={<OptionStrategyPage />} /> 
          <Route path="/stock/:ticker/statistical/ar" element={<ARModelForecastPage />} />
          <Route path="/stock/:ticker/statistical/ma" element={<MAForecastPage />} />
          <Route path="/stock/:ticker/statistical/arma" element={<ARMAForecastPage />} />
          <Route path="/stock/:ticker/statistical/arima" element={<ARIMAForecastPage />} />
          <Route path="/stock/:ticker/statistical/sarima" element={<SARIMAForecastPage />} />
          <Route path="/stock/:ticker/statistical/arimax" element={<ARIMAXForecastPage />} />
          <Route path="/stock/:ticker/statistical/var" element={<VARForecastPage />} />
        </Routes>
    </Router>
  );
};

export default App;
