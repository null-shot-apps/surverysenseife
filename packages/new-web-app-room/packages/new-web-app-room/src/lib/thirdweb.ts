import { createThirdwebClient } from "thirdweb";
import { embeddedWallet, createWallet } from "thirdweb/wallets";

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your_thirdweb_client_id_here",
});

export const wallets = [
  embeddedWallet({
    auth: {
      options: ["google", "email"],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
];
