import { useEffect, useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser
} from "@clerk/clerk-react";

function App() {
  const { isSignedIn, user } = useUser();
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    if (isSignedIn && user) {
      const registrationTime = new Date(user.createdAt);
      const now = new Date();
      const timeDifference = (now - registrationTime) / 1000; 

      if (timeDifference < 60) {
        setIsNewUser(true);

        fetch("https://your-backend.com/api/save-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            username: user.username,
            createdAt: user.createdAt,
          }),
        })
          .then((res) => res.json())
          .then((data) => console.log("User saved:", data))
          .catch((err) => console.error("Error saving user:", err));
      }
    }
  }, [isSignedIn, user]);

  return (
    <>
      <header>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
          {isNewUser && <p>🎉 Welcome, new user!</p>}
        </SignedIn>
      </header>
    </>
  );
}

export default App;
