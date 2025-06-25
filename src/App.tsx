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
        </Routes>
    </Router>
  );
};

export default App;
