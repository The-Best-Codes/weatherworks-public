"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LockOpen, Lock, Loader2 } from "lucide-react";

// LockContext to share state between components
const LockContext = React.createContext<
  | {
      isLocked: boolean | null;
      setIsLocked: React.Dispatch<React.SetStateAction<boolean | null>>;
    }
  | undefined
>(undefined);

const useLockContext = () => {
  const context = React.useContext(LockContext);
  if (!context) {
    throw new Error("useLockContext must be used within a LockProvider");
  }
  return context;
};

const LockProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLocked, setIsLocked] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if localStorage is available
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const saved = localStorage.getItem("isLocked");
        //console.log("Loaded isLocked:", saved);
        setIsLocked(saved === "true");
      } catch (error) {
        console.error("Failed to load lock state from localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (
      isLocked !== null &&
      typeof window !== "undefined" &&
      window.localStorage
    ) {
      //console.log("Saving isLocked:", isLocked);
      try {
        localStorage.setItem("isLocked", isLocked.toString());
      } catch (error) {
        console.error("Failed to save lock state to localStorage:", error);
      }
    }
  }, [isLocked]);

  // Don't render children until isLocked is initialized
  if (isLocked === null) {
    <Button
      aria-label="Loading indicator for lock screen"
      disabled
      size={"icon"}
    >
      <Loader2 className="animate-spin w-6 h-6" />
    </Button>;
  }

  return (
    <LockContext.Provider value={{ isLocked, setIsLocked }}>
      {children}
    </LockContext.Provider>
  );
};

export const LockDialog: React.FC = () => {
  const { isLocked, setIsLocked } = useLockContext();
  const [showUnlockPopup, setShowUnlockPopup] = useState<boolean>(false);
  const [unlockCode, setUnlockCode] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<string>("");

  useEffect(() => {
    if (isLocked) {
      generateUnlockCode();
    }
  }, [isLocked]);

  if (isLocked === null) {
    return null;
  }

  const generateUnlockCode = () => {
    const newCode = Array.from(
      { length: 4 },
      () => Math.floor(Math.random() * 4) + 1
    );
    setUnlockCode(newCode);
  };

  const handleScreenClick = () => {
    if (isLocked) {
      setShowUnlockPopup(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^1-4]/g, "").slice(0, 4);
    setUserInput(value);

    if (value.length === 4) {
      if (value === unlockCode.join("")) {
        unlockScreen();
      } else {
        resetInput();
      }
    }
  };

  const unlockScreen = () => {
    setIsLocked(false);
    setShowUnlockPopup(false);
    resetInput();
  };

  const resetInput = () => {
    setUserInput("");
    generateUnlockCode();
  };

  const handleDialogClose = (open: boolean) => {
    setShowUnlockPopup(open);
    if (!open) {
      resetInput();
    }
  };

  const handleButtonClick = (number: number) => {
    const newInput = (userInput + number).slice(0, 4);
    setUserInput(newInput);

    if (newInput.length === 4) {
      if (newInput === unlockCode.join("")) {
        unlockScreen();
      } else {
        resetInput();
      }
    }
  };

  return (
    <>
      {isLocked && (
        <div
          className="fixed w-full h-full min-w-screen min-h-screen top-0 left-0 z-50 bg-transparent pointer-events-all"
          onClick={handleScreenClick}
        />
      )}
      <Dialog open={showUnlockPopup} onOpenChange={handleDialogClose}>
        <DialogContent className="w-fit">
          <DialogHeader>
            <DialogTitle>Unlock Screen</DialogTitle>
          </DialogHeader>
          <Card>
            <CardHeader>
              <div className="grid grid-cols-4 gap-4 w-full">
                {unlockCode.map((number, index) => (
                  <div
                    key={index}
                    className="bg-gray-200 rounded-lg p-2 text-center"
                  >
                    {number}
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="Enter code"
                value={userInput}
                onChange={handleInputChange}
                maxLength={4}
                className="mb-4"
              />
              <div className="grid grid-cols-2 gap-4 w-full">
                {[1, 2, 3, 4].map((number) => (
                  <Button
                    key={number}
                    size={"icon"}
                    className="w-full h-12"
                    aria-label={`Number ${number}`}
                    onClick={() => handleButtonClick(number)}
                  >
                    {number}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const LockButton: React.FC = () => {
  const { isLocked, setIsLocked } = useLockContext();

  if (isLocked === null) {
    return (
      <Button
        disabled
        aria-label="Loading indicator for lock screen"
        size="icon"
        variant="default"
      >
        <Loader2 className="animate-spin w-6 h-6" />
      </Button>
    );
  }

  const toggleLock = () => {
    setIsLocked(!isLocked);
  };

  return (
    <Button size="icon" onClick={toggleLock} aria-label="Toggle screen lock">
      {isLocked ? <Lock /> : <LockOpen />}
    </Button>
  );
};

export default React.memo(LockProvider);
