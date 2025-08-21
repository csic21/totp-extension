<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { TOTP, Secret } from 'otpauth';

// Using a dictionary-like object for accounts
// Key: account name (string)
// Value: account data (object with secret)
interface TotpAccounts {
  [key: string]: {
    secret: string;
  };
}

const accounts = ref<TotpAccounts>({});
const newAccountName = ref('');
const newAccountSecret = ref('');
const currentTokens = ref<{ [key: string]: string }>({});
const remainingTimes = ref<{ [key: string]: number }>({});
let intervalId: number | undefined;

const loadAccounts = async () => {
  try {
    const result = await chrome.storage.sync.get('totpAccounts');
    // Use an empty object as default
    accounts.value = result.totpAccounts || {};
    updateAllTokens(); // Initial token generation after loading
  } catch (error) {
    console.error('Error loading accounts:', error);
  }
};

const saveAccounts = async () => {
  try {
    console.log('Saving to storage:', accounts.value);
    await chrome.storage.sync.set({ totpAccounts: accounts.value });
  } catch (error) {
    console.error('Error saving accounts:', error);
  }
};

const addAccount = async () => {
  const name = newAccountName.value.trim();
  const secret = newAccountSecret.value.trim();

  if (!name || !secret) {
    alert('Name and Secret cannot be empty.');
    return;
  }
  // Check for duplicates using object key existence
  if (accounts.value[name]) {
    alert('Account with this name already exists.');
    return;
  }

  // Add new account by setting a new key-value pair
  accounts.value[name] = { secret };
  await saveAccounts();
  updateAllTokens();
  newAccountName.value = '';
  newAccountSecret.value = '';
};

const deleteAccount = async (name: string) => {
  // Deletion is simpler
  delete accounts.value[name];
  delete currentTokens.value[name];
  delete remainingTimes.value[name];
  await saveAccounts();
};

const updateAllTokens = () => {
  const now = Date.now();
  // Iterate over object entries
  for (const [name, account] of Object.entries(accounts.value)) {
    try {
      const totp = new TOTP({
        secret: Secret.fromBase32(account.secret),
        digits: 6,
        period: 30,
        algorithm: 'SHA1',
      });
      currentTokens.value[name] = totp.generate();
      remainingTimes.value[name] = totp.period - (Math.floor(now / 1000) % totp.period);
    } catch (error) {
      console.error(`Failed to generate token for ${name}:`, error);
      // Display error state in UI
      currentTokens.value[name] = 'Error';
      remainingTimes.value[name] = 0;
    }
  }
};

const copyToClipboard = async (text: string) => {
  if (!text || text === 'Error') return;
  try {
    await navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy: ', err);
    alert('Failed to copy to clipboard.');
  }
};

onMounted(() => {
  loadAccounts();
  intervalId = setInterval(updateAllTokens, 1000) as unknown as number;
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<template>
  <div class="w-80 bg-gray-100 p-4 font-sans">
    <h1 class="text-center text-2xl font-bold text-gray-800 mb-4">TOTP Authenticator</h1>

    <div class="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 class="text-lg font-semibold text-gray-700 mb-2">Add New Account</h2>
      <input v-model="newAccountName" placeholder="Account Name" class="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <input v-model="newAccountSecret" placeholder="Secret Key (Base32)" class="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <button @click="addAccount" class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Add Account</button>
    </div>

    <div class="space-y-2">
      <h2 class="text-lg font-semibold text-gray-700 mb-2">Your Accounts</h2>
      <p v-if="Object.keys(accounts).length === 0" class="text-gray-500">No accounts added yet.</p>
      <div v-for="(_, name) in accounts" :key="name" class="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
        <div class="flex-grow">
          <h3 class="text-xl font-semibold text-gray-800">{{ name }}</h3>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-2xl font-mono text-blue-600 tracking-widest">{{ currentTokens[String(name)] || '...' }}</span>
            <progress :value="remainingTimes[String(name)]" max="30" class="w-full h-2 rounded-full overflow-hidden"></progress>
            <span class="text-sm text-gray-500">{{ remainingTimes[String(name)] }}s</span>
          </div>
        </div>
        <div class="flex flex-col gap-2 ml-4">
          <button @click="copyToClipboard(currentTokens[String(name)])" :disabled="!currentTokens[String(name)] || currentTokens[String(name)] === 'Error'" class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400">Copy</button>
          <button @click="deleteAccount(String(name))" class="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Using Tailwind CSS classes, so no scoped styles are needed here */
progress::-webkit-progress-bar {
  background-color: #e0e0e0;
  border-radius: 9999px;
}

progress::-webkit-progress-value {
  background-color: #3b82f6; /* blue-500 */
  border-radius: 9999px;
}

progress::-moz-progress-bar {
  background-color: #3b82f6; /* blue-500 */
  border-radius: 9999px;
}
</style>
