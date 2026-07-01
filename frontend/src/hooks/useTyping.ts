import { useState, useEffect, useCallback } from "react";

export function useTyping(targetWord: string){
    const[typed, setTyped] = useState("");
    const[untyped, setUntyped] = useState(targetWord);
    const[missCount, setMissCount] = useState(0);
    const[isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        setTyped("");
        setUntyped(targetWord);
        setIsCompleted(false);
    },[targetWord]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if(isCompleted || e.key.length > 1)return;

            const expectedKey = untyped[0];

            if (e.key.toUpperCase() === expectedKey.toUpperCase()) {
                setTyped((prev) => prev + expectedKey);
                setUntyped((prev) => prev.slice(1));

                if (untyped.length === 1) {
                setIsCompleted(true);
                } 
            } else {
                    setMissCount((prev) => prev + 1);
                }
        },
        [untyped, isCompleted]
    );

   useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // 手動でリセットするための関数を追加
  const resetTyping = (newWord: string, keepMissCount: boolean = false) => {
    setTyped("");
    setUntyped(newWord);
    setIsCompleted(false);

    if(!keepMissCount){
      setMissCount(0);
    }
  };

  //未入力文字の先頭が「空白」なら、自動で入力済みに移動させる
  useEffect(() => {
    if (untyped.startsWith(" ")) {
      setTyped((prev) => prev + " ");
      setUntyped((prev) => prev.slice(1));
    }
  }, [untyped]);

  // resetTyping を return に追加
  return { typed, untyped, missCount, isCompleted, resetTyping };
}