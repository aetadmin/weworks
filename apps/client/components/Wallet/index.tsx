import { useState } from 'react';
import { Button } from "@radix-ui/themes";
import { Wallet as WalletIcon, Plus, ArrowDownUp, History } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shadcn/ui/tabs";
import { Input } from "@/shadcn/ui/input";

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
}

export default function Wallet() {
  const [balance, setBalance] = useState(1000);
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'deposit', amount: 500, date: '2023-03-01' },
    { id: '2', type: 'withdrawal', amount: 200, date: '2023-03-05' },
    { id: '3', type: 'deposit', amount: 700, date: '2023-03-10' },
  ]);

  const handleDeposit = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    
    const newAmount = Number(amount);
    setBalance(prev => prev + newAmount);
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'deposit',
      amount: newAmount,
      date: new Date().toISOString().split('T')[0]
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    setAmount('');
  };

  const handleWithdraw = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0 || Number(amount) > balance) return;
    
    const newAmount = Number(amount);
    setBalance(prev => prev - newAmount);
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'withdrawal',
      amount: newAmount,
      date: new Date().toISOString().split('T')[0]
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    setAmount('');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="soft" className="flex items-center gap-2">
          <WalletIcon className="h-4 w-4" />
          <span>${balance.toFixed(2)}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Wallet</DialogTitle>
          <DialogDescription>
            Manage your account balance
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="fund">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fund">Fund</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="fund" className="space-y-4 py-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Button onClick={handleDeposit}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Funds
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                Current balance: ${balance.toFixed(2)}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="withdraw" className="space-y-4 py-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Button onClick={handleWithdraw}>
                  <ArrowDownUp className="h-4 w-4 mr-2" />
                  Withdraw
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                Current balance: ${balance.toFixed(2)}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="py-4">
            <div className="space-y-4">
              <div className="text-sm font-medium">Transaction History</div>
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex justify-between items-center p-2 border rounded"
                  >
                    <div className="flex items-center">
                      <History className="h-4 w-4 mr-2" />
                      <span>
                        {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={transaction.type === 'deposit' ? 'text-green-500' : 'text-red-500'}>
                        {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">{transaction.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 