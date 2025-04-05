export const matchManager = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "battleId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "attacker",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "damage",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "remainingHp",
        type: "uint256",
      },
    ],
    name: "Attack",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "battleId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "winner",
        type: "address",
      },
    ],
    name: "BattleEnded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "battleId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "player1",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "player2",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "player1MinDmg",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "player1MaxDmg",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "player2MinDmg",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "player2MaxDmg",
        type: "uint256",
      },
    ],
    name: "BattleStarted",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_battleId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "attacker_damage",
        type: "uint256",
      },
    ],
    name: "attack",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "battleCounter",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "battles",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "playerAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "hp",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minDamage",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxDamage",
            type: "uint256",
          },
        ],
        internalType: "struct MatchManager.Player",
        name: "player1",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "address",
            name: "playerAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "hp",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minDamage",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxDamage",
            type: "uint256",
          },
        ],
        internalType: "struct MatchManager.Player",
        name: "player2",
        type: "tuple",
      },
      {
        internalType: "address",
        name: "currentTurn",
        type: "address",
      },
      {
        internalType: "bool",
        name: "active",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_battleId",
        type: "uint256",
      },
    ],
    name: "getHP",
    outputs: [
      {
        internalType: "uint256",
        name: "p1HP",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "p2HP",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_opponent",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_player1MinDmg",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_player1MaxDmg",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_player2MinDmg",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_player2MaxDmg",
        type: "uint256",
      },
    ],
    name: "startBattle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
