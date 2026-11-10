import TransactionHistoryContainer from "../../components/transactions/TransactionHistoryContainer";

const Transactions = () => {
  return (
    <section className="p-4 sm:p-6">
      <h1 className="text-2xl font-semibold text-slate-950">Transaction History</h1>
      <div className="mt-6">
        <TransactionHistoryContainer />
      </div>
    </section>
  );
};

export default Transactions;
