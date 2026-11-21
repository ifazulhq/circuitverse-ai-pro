import * as React from "react";

export const CircuitSymbolDefinitions: React.FC = () => (
  <defs>
    <linearGradient
      id="circuit-gate-gradient"
      x1="0"
      y1="0"
      x2="0"
      y2="1"
    >
      <stop
        offset="0%"
        stopColor="currentColor"
        stopOpacity="0.28"
      />
      <stop
        offset="48%"
        stopColor="currentColor"
        stopOpacity="0.12"
      />
      <stop
        offset="100%"
        stopColor="currentColor"
        stopOpacity="0.04"
      />
    </linearGradient>

    <linearGradient
      id="circuit-highlight-gradient"
      x1="0"
      y1="0"
      x2="1"
      y2="1"
    >
      <stop
        offset="0%"
        stopColor="white"
        stopOpacity="0.18"
      />
      <stop
        offset="55%"
        stopColor="white"
        stopOpacity="0.04"
      />
      <stop
        offset="100%"
        stopColor="white"
        stopOpacity="0"
      />
    </linearGradient>

    <filter
      id="circuit-gate-shadow"
      x="-30%"
      y="-30%"
      width="160%"
      height="170%"
    >
      <feDropShadow
        dx="0"
        dy="2"
        stdDeviation="2"
        floodColor="black"
        floodOpacity="0.35"
      />
    </filter>
  </defs>
);

export const renderCircuitSymbolDefinitions = () => (
  <CircuitSymbolDefinitions />
);

export const renderCircuitSymbol = (type: string): React.ReactNode => {
  switch (type) {
    case "AND Gate":
      return (
        <svg
          width="72"
          height="48"
          viewBox="0 0 72 48"
          aria-label="AND gate"
        >
          <CircuitSymbolDefinitions />
          <path
            d="M8 6 H36 A18 18 0 0 1 36 42 H8 Z"
            fill="url(#circuit-gate-gradient)"
            stroke="currentColor"
            strokeWidth="2"
            filter="url(#circuit-gate-shadow)"
          />
          <path
            d="M9 7 H36 A17 17 0 0 1 50 18"
            fill="none"
            stroke="url(#circuit-highlight-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            pointerEvents="none"
          />
          <line
            x1="0"
            y1="16"
            x2="8"
            y2="16"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="32"
            x2="8"
            y2="32"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="54"
            y1="24"
            x2="72"
            y2="24"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text
            x="27"
            y="28"
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
          >
            AND
          </text>
        </svg>
      );

    case "OR Gate":
      return (
        <svg
          width="72"
          height="48"
          viewBox="0 0 72 48"
          aria-label="OR gate"
        >
          <CircuitSymbolDefinitions />
          <path
            d="M8 6 Q30 6 54 24 Q30 42 8 42 Q18 24 8 6 Z"
            fill="url(#circuit-gate-gradient)"
            stroke="currentColor"
            strokeWidth="2"
            filter="url(#circuit-gate-shadow)"
          />
          <path
            d="M10 7 Q30 7 50 21"
            fill="none"
            stroke="url(#circuit-highlight-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            pointerEvents="none"
          />
          <line
            x1="0"
            y1="16"
            x2="12"
            y2="16"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="32"
            x2="12"
            y2="32"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="54"
            y1="24"
            x2="72"
            y2="24"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text
            x="34"
            y="28"
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
          >
            OR
          </text>
        </svg>
      );

    case "NOT Gate":
      return (
        <svg
          width="72"
          height="48"
          viewBox="0 0 72 48"
          aria-label="NOT gate"
        >
          <CircuitSymbolDefinitions />
          <path
            d="M10 8 L48 24 L10 40 Z"
            fill="url(#circuit-gate-gradient)"
            stroke="currentColor"
            strokeWidth="2"
            filter="url(#circuit-gate-shadow)"
          />
          <path
            d="M11 9 L45 23"
            fill="none"
            stroke="url(#circuit-highlight-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            pointerEvents="none"
          />
          <circle
            cx="53"
            cy="24"
            r="5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="24"
            x2="10"
            y2="24"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="58"
            y1="24"
            x2="72"
            y2="24"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text
            x="28"
            y="27"
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
          >
            NOT
          </text>
        </svg>
      );

    case "NAND Gate":
      return (
        <svg
          width="72"
          height="48"
          viewBox="0 0 72 48"
          aria-label="NAND gate"
        >
          <CircuitSymbolDefinitions />
          <path
            d="M8 6 H34 A18 18 0 0 1 34 42 H8 Z"
            fill="url(#circuit-gate-gradient)"
            stroke="currentColor"
            strokeWidth="2"
            filter="url(#circuit-gate-shadow)"
          />
          <path
            d="M9 7 H34 A17 17 0 0 1 48 18"
            fill="none"
            stroke="url(#circuit-highlight-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            pointerEvents="none"
          />
          <circle
            cx="55"
            cy="24"
            r="5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line x1="0" y1="16" x2="8" y2="16" stroke="currentColor" strokeWidth="2" />
          <line x1="0" y1="32" x2="8" y2="32" stroke="currentColor" strokeWidth="2" />
          <line x1="60" y1="24" x2="72" y2="24" stroke="currentColor" strokeWidth="2" />
          <text
            x="28"
            y="28"
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
          >
            NAND
          </text>
        </svg>
      );

    case "NOR Gate":
      return (
        <svg
          width="72"
          height="48"
          viewBox="0 0 72 48"
          aria-label="NOR gate"
        >
          <CircuitSymbolDefinitions />
          <path
            d="M8 6 Q30 6 54 24 Q30 42 8 42 Q18 24 8 6 Z"
            fill="url(#circuit-gate-gradient)"
            stroke="currentColor"
            strokeWidth="2"
            filter="url(#circuit-gate-shadow)"
          />
          <path
            d="M10 7 Q30 7 50 21"
            fill="none"
            stroke="url(#circuit-highlight-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            pointerEvents="none"
          />
          <circle
            cx="57"
            cy="24"
            r="5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line x1="0" y1="16" x2="12" y2="16" stroke="currentColor" strokeWidth="2" />
          <line x1="0" y1="32" x2="12" y2="32" stroke="currentColor" strokeWidth="2" />
          <line x1="62" y1="24" x2="72" y2="24" stroke="currentColor" strokeWidth="2" />
          <text
            x="32"
            y="28"
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
          >
            NOR
          </text>
        </svg>
      );

    case "XOR Gate":
      return (
        <svg
          width="72"
          height="48"
          viewBox="0 0 72 48"
          aria-label="XOR gate"
        >
          <CircuitSymbolDefinitions />
          <path
            d="M14 6 Q34 6 56 24 Q34 42 14 42 Q22 24 14 6 Z"
            fill="url(#circuit-gate-gradient)"
            stroke="currentColor"
            strokeWidth="2"
            filter="url(#circuit-gate-shadow)"
          />
          <path
            d="M16 7 Q34 7 52 21"
            fill="none"
            stroke="url(#circuit-highlight-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            pointerEvents="none"
          />
          <path
            d="M7 6 Q15 24 7 42"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line x1="0" y1="16" x2="12" y2="16" stroke="currentColor" strokeWidth="2" />
          <line x1="0" y1="32" x2="12" y2="32" stroke="currentColor" strokeWidth="2" />
          <line x1="56" y1="24" x2="72" y2="24" stroke="currentColor" strokeWidth="2" />
          <text
            x="35"
            y="28"
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
          >
            XOR
          </text>
        </svg>
      );

    case "XNOR Gate":
      return (
        <svg
          width="72"
          height="48"
          viewBox="0 0 72 48"
          aria-label="XNOR gate"
        >
          <CircuitSymbolDefinitions />
          <path
            d="M14 6 Q34 6 56 24 Q34 42 14 42 Q22 24 14 6 Z"
            fill="url(#circuit-gate-gradient)"
            stroke="currentColor"
            strokeWidth="2"
            filter="url(#circuit-gate-shadow)"
          />
          <path
            d="M16 7 Q34 7 52 21"
            fill="none"
            stroke="url(#circuit-highlight-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            pointerEvents="none"
          />
          <path
            d="M7 6 Q15 24 7 42"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx="61"
            cy="24"
            r="5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line x1="0" y1="16" x2="12" y2="16" stroke="currentColor" strokeWidth="2" />
          <line x1="0" y1="32" x2="12" y2="32" stroke="currentColor" strokeWidth="2" />
          <line x1="66" y1="24" x2="72" y2="24" stroke="currentColor" strokeWidth="2" />
          <text
            x="35"
            y="28"
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
          >
            XNOR
          </text>
        </svg>
      );

    case "MUX":
      return (
        <svg
          width="80"
          height="56"
          viewBox="0 0 80 56"
          aria-label="Multiplexer"
        >
          <CircuitSymbolDefinitions />
          <path
            d="M18 6 H62 L72 28 L62 50 H18 Z"
            fill="url(#circuit-gate-gradient)"
            stroke="currentColor"
            strokeWidth="2"
            filter="url(#circuit-gate-shadow)"
          />
          <path
            d="M19 7 H61 L69 27"
            fill="none"
            stroke="url(#circuit-highlight-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            pointerEvents="none"
          />
          <line
            x1="0"
            y1="16"
            x2="18"
            y2="16"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="40"
            x2="18"
            y2="40"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="40"
            y1="56"
            x2="40"
            y2="50"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="72"
            y1="28"
            x2="80"
            y2="28"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text
            x="45"
            y="32"
            textAnchor="middle"
            fontSize="9"
            fill="currentColor"
          >
            MUX
          </text>
        </svg>
      );

    case "DEMUX":
      return (
        <svg
          width="80"
          height="56"
          viewBox="0 0 80 56"
          aria-label="Demultiplexer"
        >
          <CircuitSymbolDefinitions />
          <path
            d="M8 28 L62 6 V50 Z"
            fill="url(#circuit-gate-gradient)"
            stroke="currentColor"
            strokeWidth="2"
            filter="url(#circuit-gate-shadow)"
          />
          <path
            d="M11 27 L60 8"
            fill="none"
            stroke="url(#circuit-highlight-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            pointerEvents="none"
          />
          <line
            x1="0"
            y1="28"
            x2="8"
            y2="28"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="62"
            y1="14"
            x2="80"
            y2="14"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="62"
            y1="28"
            x2="80"
            y2="28"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="62"
            y1="42"
            x2="80"
            y2="42"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="40"
            y1="56"
            x2="40"
            y2="48"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text
            x="38"
            y="32"
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
          >
            DEMUX
          </text>
        </svg>
      );

    case "DECODER":
      return (
        <svg
          width="82"
          height="60"
          viewBox="0 0 82 60"
          aria-label="Decoder"
        >
          <CircuitSymbolDefinitions />
          <rect
            x="18"
            y="6"
            width="46"
            height="48"
            rx="2"
            fill="url(#circuit-gate-gradient)"
            stroke="currentColor"
            strokeWidth="2"
            filter="url(#circuit-gate-shadow)"
          />
          <path
            d="M20 8 H61"
            fill="none"
            stroke="url(#circuit-highlight-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            pointerEvents="none"
          />
          <line
            x1="0"
            y1="18"
            x2="18"
            y2="18"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="42"
            x2="18"
            y2="42"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="64"
            y1="12"
            x2="82"
            y2="12"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="64"
            y1="24"
            x2="82"
            y2="24"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="64"
            y1="36"
            x2="82"
            y2="36"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="64"
            y1="48"
            x2="82"
            y2="48"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text
            x="41"
            y="33"
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
          >
            DEC
          </text>
        </svg>
      );

    case "ENCODER":
      return (
        <svg
          width="82"
          height="60"
          viewBox="0 0 82 60"
          aria-label="Encoder"
        >
          <CircuitSymbolDefinitions />
          <rect
            x="18"
            y="6"
            width="46"
            height="48"
            rx="2"
            fill="url(#circuit-gate-gradient)"
            stroke="currentColor"
            strokeWidth="2"
            filter="url(#circuit-gate-shadow)"
          />
          <path
            d="M20 8 H61"
            fill="none"
            stroke="url(#circuit-highlight-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            pointerEvents="none"
          />
          <line
            x1="0"
            y1="12"
            x2="18"
            y2="12"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="24"
            x2="18"
            y2="24"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="36"
            x2="18"
            y2="36"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="48"
            x2="18"
            y2="48"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="64"
            y1="22"
            x2="82"
            y2="22"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="64"
            y1="38"
            x2="82"
            y2="38"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text
            x="41"
            y="33"
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
          >
            ENC
          </text>
        </svg>
      );

    case "HALF ADDER":
      return (
        <svg
          width="88"
          height="60"
          viewBox="0 0 88 60"
          aria-label="Half Adder"
        >
          <rect
            x="18"
            y="6"
            width="52"
            height="48"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="20"
            x2="18"
            y2="20"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="40"
            x2="18"
            y2="40"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="70"
            y1="20"
            x2="88"
            y2="20"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="70"
            y1="40"
            x2="88"
            y2="40"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text
            x="44"
            y="27"
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
          >
            HA
          </text>
          <text
            x="44"
            y="40"
            textAnchor="middle"
            fontSize="6"
            fill="currentColor"
          >
            SUM/CARRY
          </text>
        </svg>
      );

    case "FULL ADDER":
      return (
        <svg
          width="92"
          height="68"
          viewBox="0 0 92 68"
          aria-label="Full Adder"
        >
          <rect
            x="18"
            y="6"
            width="56"
            height="56"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="16"
            x2="18"
            y2="16"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="34"
            x2="18"
            y2="34"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="52"
            x2="18"
            y2="52"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="74"
            y1="24"
            x2="92"
            y2="24"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="74"
            y1="48"
            x2="92"
            y2="48"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text
            x="46"
            y="30"
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
          >
            FULL
          </text>
          <text
            x="46"
            y="43"
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
          >
            ADDER
          </text>
        </svg>
      );

    case "SR LATCH":
      return (
        <svg
          width="88"
          height="60"
          viewBox="0 0 88 60"
          aria-label="SR latch"
        >
          <rect
            x="18"
            y="6"
            width="52"
            height="48"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="18"
            x2="18"
            y2="18"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="42"
            x2="18"
            y2="42"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="70"
            y1="18"
            x2="88"
            y2="18"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="70"
            y1="42"
            x2="88"
            y2="42"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text
            x="44"
            y="28"
            textAnchor="middle"
            fontSize="9"
            fill="currentColor"
          >
            SR
          </text>
          <text
            x="44"
            y="41"
            textAnchor="middle"
            fontSize="7"
            fill="currentColor"
          >
            LATCH
          </text>
          <text
            x="8"
            y="15"
            textAnchor="middle"
            fontSize="6"
            fill="currentColor"
          >
            S
          </text>
          <text
            x="8"
            y="51"
            textAnchor="middle"
            fontSize="6"
            fill="currentColor"
          >
            R
          </text>
          <text
            x="78"
            y="15"
            textAnchor="middle"
            fontSize="6"
            fill="currentColor"
          >
            Q
          </text>
          <text
            x="78"
            y="51"
            textAnchor="middle"
            fontSize="6"
            fill="currentColor"
          >
            Q̅
          </text>
        </svg>
      );

    case "D FLIP-FLOP":
      return (
        <svg
          width="88"
          height="68"
          viewBox="0 0 88 68"
          aria-label="D flip-flop"
        >
          <rect
            x="18"
            y="6"
            width="52"
            height="56"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="22"
            x2="18"
            y2="22"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="46"
            x2="18"
            y2="46"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="70"
            y1="22"
            x2="88"
            y2="22"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="70"
            y1="46"
            x2="88"
            y2="46"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M18 38 L24 42 L18 46"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text
            x="44"
            y="29"
            textAnchor="middle"
            fontSize="9"
            fill="currentColor"
          >
            D
          </text>
          <text
            x="44"
            y="42"
            textAnchor="middle"
            fontSize="7"
            fill="currentColor"
          >
            FF
          </text>
          <text
            x="8"
            y="19"
            textAnchor="middle"
            fontSize="6"
            fill="currentColor"
          >
            D
          </text>
          <text
            x="8"
            y="59"
            textAnchor="middle"
            fontSize="6"
            fill="currentColor"
          >
            CLK
          </text>
          <text
            x="78"
            y="19"
            textAnchor="middle"
            fontSize="6"
            fill="currentColor"
          >
            Q
          </text>
          <text
            x="78"
            y="59"
            textAnchor="middle"
            fontSize="6"
            fill="currentColor"
          >
            Q̅
          </text>
        </svg>
      );

    case "JK FLIP-FLOP":
      return (
        <svg
          width="92"
          height="68"
          viewBox="0 0 92 68"
          aria-label="JK flip-flop"
        >
          <rect
            x="18"
            y="6"
            width="56"
            height="56"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="16"
            x2="18"
            y2="16"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="32"
            x2="18"
            y2="32"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="52"
            x2="18"
            y2="52"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="74"
            y1="22"
            x2="92"
            y2="22"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="74"
            y1="46"
            x2="92"
            y2="46"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M18 40 L24 44 L18 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text
            x="46"
            y="29"
            textAnchor="middle"
            fontSize="9"
            fill="currentColor"
          >
            JK
          </text>
          <text
            x="46"
            y="42"
            textAnchor="middle"
            fontSize="7"
            fill="currentColor"
          >
            FF
          </text>
          <text
            x="8"
            y="13"
            textAnchor="middle"
            fontSize="6"
            fill="currentColor"
          >
            J
          </text>
          <text
            x="8"
            y="29"
            textAnchor="middle"
            fontSize="6"
            fill="currentColor"
          >
            K
          </text>
          <text
            x="8"
            y="59"
            textAnchor="middle"
            fontSize="6"
            fill="currentColor"
          >
            CLK
          </text>
          <text
            x="83"
            y="19"
            textAnchor="middle"
            fontSize="6"
            fill="currentColor"
          >
            Q
          </text>
          <text
            x="83"
            y="59"
            textAnchor="middle"
            fontSize="6"
            fill="currentColor"
          >
            Q̅
          </text>
        </svg>
      );

    case "T FLIP-FLOP":
      return (
        <svg
          width="88"
          height="68"
          viewBox="0 0 88 68"
          aria-label="T flip-flop"
        >
          <rect
            x="18"
            y="6"
            width="52"
            height="56"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="22"
            x2="18"
            y2="22"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="46"
            x2="18"
            y2="46"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="70"
            y1="22"
            x2="88"
            y2="22"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="70"
            y1="46"
            x2="88"
            y2="46"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M18 38 L24 42 L18 46"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text
            x="44"
            y="29"
            textAnchor="middle"
            fontSize="9"
            fill="currentColor"
          >
            T
          </text>
          <text
            x="44"
            y="42"
            textAnchor="middle"
            fontSize="7"
            fill="currentColor"
          >
            FF
          </text>
          <text
            x="8"
            y="19"
            textAnchor="middle"
            fontSize="6"
            fill="currentColor"
          >
            T
          </text>
          <text
            x="8"
            y="59"
            textAnchor="middle"
            fontSize="6"
            fill="currentColor"
          >
            CLK
          </text>
          <text
            x="78"
            y="19"
            textAnchor="middle"
            fontSize="6"
            fill="currentColor"
          >
            Q
          </text>
          <text
            x="78"
            y="59"
            textAnchor="middle"
            fontSize="6"
            fill="currentColor"
          >
            Q̅
          </text>
        </svg>
      );

    default:
      return null;
  }
};

export const CircuitSymbol: React.FC<{ type: string }> = React.memo(({ type }) => {
  return <>{renderCircuitSymbol(type) ?? <span>{type}</span>}</>;
});
CircuitSymbol.displayName = "CircuitSymbol";
