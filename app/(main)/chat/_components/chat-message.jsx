"use client";

import { useState } from "react";
import styles from "./chatMessage.module.css";
import ReactMarkdown from "react-markdown";

export default function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const copyContent = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`${styles.wrapper} ${isUser ? styles.user : styles.assistant}`}>
      <div className={styles.avatar}>
        {isUser ? (
          <span className={styles.avatarUser}>U</span>
        ) : (
          <span className={styles.avatarGrok}>✦</span>
        )}
      </div>

      <div className={styles.bubble}>
        {message.content ? (
          <div className={styles.content}>
            <ReactMarkdown
              components={{
                code({ inline, children, ...props }) {
                  return inline ? (
                    <code className={styles.inlineCode} {...props}>
                      {children}
                    </code>
                  ) : (
                    <pre className={styles.codeBlock}>
                      <code {...props}>{children}</code>
                    </pre>
                  );
                },
                p({ children }) {
                  return <p className={styles.paragraph}>{children}</p>;
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : null}

        {!isUser && message.content && (
          <button
            className={styles.copyBtn}
            onClick={copyContent}
            title="Copy message"
          >
            {copied ? "✓" : "⎘"}
          </button>
        )}
      </div>
    </div>
  );
}
