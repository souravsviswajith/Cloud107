import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

interface TerminalLine {
  text: string | React.ReactNode;
  isPrompt?: boolean;
}

const COMMANDS = [
  'help', 'clear', 'pwd', 'ls', 'cd', 'echo', 'date', 
  'whoami', 'hostname', 'uname', 'history', 'neofetch', 'cat'
];

const WELCOME_TEXT = `Cloud 107 Terminal
Version 0.1

Type "help" to view available commands.

Available Commands

help
clear
pwd
ls
cd
echo
date
whoami
hostname
uname
history
neofetch
cat welcome.txt
`;

const NEOFETCH = `       _,met$$$$$gg.          demo@cloud
    ,g$$$$$$$$$$$$$$$P.       ----------
  ,g$$P"     """Y$$.".        OS: Cloud 107
 ,$$P'              \`$$$.     Kernel: 6.1.0-cloud
',$$P       ,ggs.     \`$$b:   Uptime: 14 mins
\`d$$'     ,$P"'   .    $$$    Shell: bash 5.1.16
 $$P      d$'     ,    $$P    Resolution: 1920x1080
 $$:      $$.   -    ,d$$'    WM: CloudWM
 $$;      Y$b._   _,d$P'      Memory: 1024MiB / 8192MiB
 Y$$.    \`.\`"Y$$$$P"'
 \`$$b      "-.__
  \`Y$$
   \`Y$$.
     \`$$b.
       \`Y$$b.
          \`"Y$b._
              \`"""
`;

const WELCOME_FILE_CONTENT = `# Welcome to Cloud 107

This is a browser-based cloud desktop prototype.

Demo Highlights

• Interactive Notes
• Interactive Terminal
• Minimal Browser
• Window Management
• Cloud 107 Architecture

Quick Start

1. Edit this document.
2. Open Terminal.
3. Type "help".
4. Open Browser.
5. Explore the workspace.

Enjoy the demo.
`;

export function TerminalApp() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [isBooting, setIsBooting] = useState(true);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cwd, setCwd] = useState('/home/demo');
  
  const endOfTerminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    endOfTerminalRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [lines, input]);

  useEffect(() => {
    const focusInput = () => inputRef.current?.focus();
    focusInput();
    
    // Startup animation
    let i = 0;
    const textLines = WELCOME_TEXT.split('\n');
    const bootInterval = setInterval(() => {
      if (i < textLines.length) {
        setLines(prev => [...prev, { text: textLines[i] }]);
        i++;
      } else {
        clearInterval(bootInterval);
        setIsBooting(false);
      }
    }, 50);
    
    return () => clearInterval(bootInterval);
  }, []);

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) {
      setLines(prev => [...prev, { text: `demo@cloud:${cwd}$ `, isPrompt: true }]);
      return;
    }

    const args = trimmedCmd.split(' ');
    const baseCmd = args[0];

    const newHistory = [...history, trimmedCmd];
    setHistory(newHistory);
    setHistoryIndex(-1);

    const promptLine: TerminalLine = { text: `demo@cloud:${cwd}$ ${trimmedCmd}`, isPrompt: true };
    let response: string | React.ReactNode = '';

    switch (baseCmd) {
      case 'help':
        response = `Available Commands\n\n${COMMANDS.join('\n')}\ncat welcome.txt`;
        break;
      case 'clear':
        setLines([]);
        return; 
      case 'pwd':
        response = cwd;
        break;
      case 'ls':
        response = cwd === '/home/demo' ? 'welcome.txt' : '';
        break;
      case 'cd': {
        const dir = args[1];
        if (!dir || dir === '~') {
          setCwd('/home/demo');
        } else if (dir === '..') {
          const parts = cwd.split('/').filter(Boolean);
          parts.pop();
          setCwd('/' + parts.join('/'));
        } else {
          setCwd(cwd === '/' ? `/${dir}` : `${cwd}/${dir}`);
        }
        break;
      }
      case 'echo':
        response = args.slice(1).join(' ');
        break;
      case 'date':
        response = new Date().toString();
        break;
      case 'whoami':
        response = 'demo';
        break;
      case 'hostname':
        response = 'cloud';
        break;
      case 'uname':
        response = 'Linux';
        break;
      case 'history':
        response = newHistory.map((h, i) => `  ${i + 1}  ${h}`).join('\n');
        break;
      case 'neofetch':
        response = NEOFETCH;
        break;
      case 'cat':
        if (args[1] === 'welcome.txt' && cwd === '/home/demo') {
          response = WELCOME_FILE_CONTENT;
        } else if (args[1]) {
          response = `cat: ${args[1]}: No such file or directory`;
        } else {
          response = 'cat: missing operand';
        }
        break;
      default:
        response = `${baseCmd}: command not found`;
    }

    setLines(prev => [...prev, promptLine, ...(response ? [{ text: response }] : [])]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIndex);
        setInput(history[history.length - 1 - nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(history[history.length - 1 - nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const match = COMMANDS.find(c => c.startsWith(input));
      if (match) {
        setInput(match);
      } else if (input === 'cat w') {
        setInput('cat welcome.txt');
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      setLines(prev => [...prev, { text: `demo@cloud:${cwd}$ ${input}^C`, isPrompt: true }]);
      setInput('');
      setHistoryIndex(-1);
    }
  };

  return (
    <div 
      className="h-full bg-[#1e1e1e] text-[#cccccc] font-mono text-sm p-2 overflow-y-auto"
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map((line, i) => (
        <div key={i} className="whitespace-pre-wrap mb-1 leading-relaxed">
          {line.isPrompt ? (
            <span>
              <span className="text-emerald-400 font-bold">demo@cloud</span>
              <span className="text-white">:</span>
              <span className="text-blue-400 font-bold">{line.text.toString().split('$ ')[0].split(':')[1]}</span>
              <span className="text-white">$ </span>
              {line.text.toString().split('$ ')[1]}
            </span>
          ) : (
            line.text
          )}
        </div>
      ))}
      {!isBooting && (
        <div className="flex relative">
          <span className="mr-2 whitespace-pre">
            <span className="text-emerald-400 font-bold">demo@cloud</span>
            <span className="text-white">:</span>
            <span className="text-blue-400 font-bold">{cwd}</span>
            <span className="text-white">$</span>
          </span>
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="absolute inset-0 bg-transparent outline-none border-none text-transparent caret-transparent w-full z-10"
              spellCheck={false}
              autoComplete="off"
            />
            <div className="absolute inset-0 pointer-events-none text-[#cccccc] whitespace-pre flex">
              <span>{input}</span>
              <motion.span 
                animate={{ opacity: [1, 0, 1] }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="inline-block w-2.5 h-4 bg-[#cccccc] ml-[1px]"
              />
            </div>
          </div>
        </div>
      )}
      <div ref={endOfTerminalRef} />
    </div>
  );
}
