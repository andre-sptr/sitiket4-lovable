import React, { useRef, useCallback } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) {
      toggleTheme();
      return;
    }

    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    if (document.startViewTransition) {
      document.documentElement.style.setProperty('--theme-toggle-x', `${x}px`);
      document.documentElement.style.setProperty('--theme-toggle-y', `${y}px`);
      document.documentElement.style.setProperty('--theme-toggle-radius', `${maxRadius}px`);

      document.startViewTransition(() => {
        toggleTheme();
      });
    } else {
      toggleTheme();
    }
  }, [toggleTheme]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          ref={buttonRef}
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className="relative h-9 w-9 overflow-hidden hover:bg-primary/10 transition-colors duration-300"
        >
          <AnimatePresence mode="wait">
            {theme === 'dark' ? (
              <motion.div
                key="moon"
                initial={{ rotate: 90, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: -90, scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute"
              >
                <Moon className="w-[18px] h-[18px] text-primary" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: -90, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute"
              >
                <Sun className="w-[18px] h-[18px] text-amber-500" />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}</p>
      </TooltipContent>
    </Tooltip>
  );
};
