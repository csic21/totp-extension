# TOTP Authenticator Extension

A simple and clean Time-based One-Time Password (TOTP) authenticator browser extension.

![GitHub stars](https://img.shields.io/github/stars/csic21/totp-extension?style=social)

## Features

- Add and manage TOTP accounts.
- Generates TOTP codes.
- Copy codes to clipboard.
- QR code scanning (coming soon).

## Development

- Built with Vue 3, Vite, and Tailwind CSS.
- Uses `otpauth` for TOTP generation.

### Setup

```bash
# Install dependencies
pnpm install

# Run the development server
pnpm run dev

# Build the extension
pnpm run build
```