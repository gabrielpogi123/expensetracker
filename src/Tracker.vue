<script setup>
import { ref, computed } from 'vue';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import db from './firebase/config'; 

const expenses = ref([]);
const newExpense = ref({
    item: '',
    category: '',
    amount: 0,
});
const amountInput = ref('');
const editingIndex = ref(null);


const fetchExpenses = async () => {
    const q = query(collection(db, 'expenses'), orderBy('dateTime', 'desc'));


    const unsubscribe = onSnapshot(q, (snapshot) => {
        expenses.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });
};


import { onMounted } from 'vue';
onMounted(fetchExpenses);


const addOrUpdateExpense = async () => {
    if (!newExpense.value.item || !newExpense.value.category || !amountInput.value) {
        alert('Please fill up all the fields.');
        return;
    }

    if (isNaN(parseFloat(amountInput.value))) {
        alert('Please enter a valid number for the amount.');
        return;
    }

    if (editingIndex.value === null) {
        await addExpense();
    } else {
        await updateExpense();
    }
};


const addExpense = async () => {
    const dateTime = new Date().toLocaleString();
    const expense = { ...newExpense.value, amount: parseFloat(amountInput.value), dateTime };

    try {
        const docRef = await addDoc(collection(db, 'expenses'), expense);
        console.log('Expense added with ID: ', docRef.id);
    } catch (error) {
        console.error('Error adding expense: ', error);
    }

    newExpense.value = {
        item: '',
        category: '',
        amount: 0,
    };
    amountInput.value = '';
};


const updateExpense = async () => {
    const expenseId = expenses.value[editingIndex.value].id;
    const expense = { ...newExpense.value, amount: parseFloat(amountInput.value) };

    try {
        await updateDoc(doc(db, 'expenses', expenseId), expense);
        console.log('Expense updated with ID: ', expenseId);
    } catch (error) {
        console.error('Error updating expense: ', error);
    }

    newExpense.value = {
        item: '',
        category: '',
        amount: 0,
    };
    amountInput.value = '';
    editingIndex.value = null;
};


const deleteExpense = async (id) => {
    try {
        await deleteDoc(doc(db, 'expenses', id));
        console.log('Expense deleted with ID: ', id);
    } catch (error) {
        console.error('Error deleting expense: ', error);
    }
};


const confirmDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
        deleteExpense(id);
    }
};


const editExpense = (index) => {
    const expense = expenses.value[index];
    newExpense.value = {
        item: expense.item,
        category: expense.category,
        amount: expense.amount,
    };
    amountInput.value = expense.amount;
    editingIndex.value = index;
};

const totalExpenses = computed(() => {
    return expenses.value.reduce((total, expense) => total + parseFloat(expense.amount), 0);
});
</script>


<template>
  <div class="flex justify-center items-center min-h-screen bg-green-100 border">
    <div class="container mx-auto p-8 bg-grey rounded-lg shadow-lg border border-gray-300 bg-grey-200 w-full">
      <h1 class="text-5xl text-center text-indigo-800 mb-10 font-semibold">Expense Tracker</h1>
      <div class="flex">
        <div class="flex-1 mr-8 max-w-lg">
          <input type="text" v-model="newExpense.item" placeholder="Item" class="input-field mb-4">
          <select v-model="newExpense.category" class="input-field mb-4">
            <option value="" disabled selected>Select Category Expense</option>
            <option value="food">Food</option>
            <option value="clothes">Clothes</option>
            <option value="appliances">Appliances</option>
            <option value="transportation">Transportation</option>
          </select>
          <input type="text" v-model="amountInput" placeholder="Amount" class="input-field mb-4">
          <button @click="addOrUpdateExpense" class="btn-primary">
            {{ editingIndex !== null ? 'Save' : 'Add' }}
          </button>
        </div>
        <div class="flex-1 relative">
          <div class="expenses-table-container border border-gray-300 p-4">
            <table class="w-full">
              <thead>
                <tr>
                  <th class="border px-4 py-2">Date & Time</th>
                  <th class="border px-4 py-2">Item</th>
                  <th class="border px-4 py-2">Category</th>
                  <th class="border px-4 py-2">Amount</th>
                  <th class="border px-4 py-2 actions-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(expense, index) in expenses" :key="index">
                  <td class="border px-4 py-2">{{ expense.dateTime }}</td>
                  <td class="border px-4 py-2">{{ expense.item }}</td>
                  <td class="border px-4 py-2">{{ expense.category }}</td>
                  <td class="border px-4 py-2">{{ expense.amount }}</td>
                  <td class="border px-4 py-2">
                    <button @click="editExpense(index)" class="btn-secondary">
                      Edit
                    </button>
                    <button @click="confirmDelete(expense.id)" class="btn-danger">
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="total-expenses border-t border-gray-300 p-4 bg-gray-200 text-center font-bold text-lg">
            Total Expenses: {{ totalExpenses.toFixed(2) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.input-field {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  box-sizing: border-box;
}

.btn-primary {
  background-color: #4a90e2;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.btn-secondary {
  background-color: #3498db;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.expenses-table-container {
  overflow-x: auto;
  max-height: 400px;
}

.total-expenses {
  padding: 1rem;
  text-align: center;
}
.expenses-table-container th.actions-column {
  width: 500px;
}
</style>