"use client";

import { useState, useEffect } from "react";

interface TypingAnimationProps {
  words: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export function TypingAnimation({
  words,
  className = "",
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
}: TypingAnimationProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Find the longest word to reserve space
  const longestWord = words.reduce((a, b) => (a.length > b.length ? a : b), "");

  useEffect(() => {
    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(pauseTimer);
    }

    const currentWord = words[currentWordIndex];
    const speed = isDeleting ? deletingSpeed : typingSpeed;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < currentWord.length) {
          setCurrentText(currentWord.slice(0, currentText.length + 1));
        } else {
          setIsPaused(true);
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, isPaused, currentWordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className="inline-block relative break-words whitespace-normal max-w-full overflow-hidden box-border">
      {/* Invisible placeholder to reserve space - ensures layout doesn't shift */}
      <span className={`${className} invisible block max-w-full overflow-hidden`} aria-hidden="true">
        {longestWord}
      </span>
      {/* Visible animated text - absolutely positioned over the placeholder */}
      <span
        className={`${className} absolute top-0 left-0 max-w-full overflow-hidden`}
        aria-label={currentText || longestWord}
      >
        {currentText}
      </span>
    </span>
  );
}
