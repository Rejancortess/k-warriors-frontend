import AddStockContainer from "../../components/stock-in/AddStockContainer";
import StepsCard from "../../components/stock-in/StepsCard";

const StockIn = () => {
  return (
    <div className="flex w-full flex-1 flex-col items-stretch justify-start gap-4 p-4 sm:items-center sm:justify-center sm:p-6">
      <div className="flex w-full max-w-5xl flex-col items-center gap-4">
        <StepsCard />
        <AddStockContainer />
      </div>
    </div>
  );
};

export default StockIn;
