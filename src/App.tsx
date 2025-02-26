import { useAuthenticator } from '@aws-amplify/ui-react';
import {
  createAmplifyAuthAdapter,
  createStorageBrowser,
} from "@aws-amplify/ui-react-storage/browser";
import "@aws-amplify/ui-react-storage/styles.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);

export const { StorageBrowser } = createStorageBrowser({
  config: createAmplifyAuthAdapter(),
});

function App() {
  const { signOut } = useAuthenticator();
  return (
    <>
      <StorageBrowser />
      <button onClick={signOut}>Sign out</button>
    </>
  );
}

export default App;
