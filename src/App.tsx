import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { router } from "./routes";
import { SocketProvider } from "./contexts/SocketContext";

function App() {
  return (
    <SocketProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors expand/>
    </SocketProvider>
  );
}

export default App;
