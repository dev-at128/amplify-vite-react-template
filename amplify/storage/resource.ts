import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "amplifyStorageBrowserDrive",
  access: (allow) => ({
    "zip/*": [
      allow.authenticated.to(["read", "delete"]),
    ]
  }),
});
