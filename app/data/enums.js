// I should probably export this from Kujata really.

const Enums = {
  SpecialEffects: {
    DamageMP: 0x1, // Damage is dealt to targets MP instead of HP.
    ForcePhysical: 0x4, // The attack is always considered to be physical for damage calculation.
    DrainPartialInflictedDamage: 0x10, // The user should recover some HP based on the damage dealt.
    DrainHPAndMP: 0x20, // The user should recover some HP and MP based on damage dealt.
    DiffuseAttack: 0x40, // The attack should diffuse into other targets after hitting. This is no longer used and is thought to only have been used with Blade Beam.
    IgnoreStatusDefense: 0x80, // Ignores the target's status defense when calculating infliction chance.
    MissWhenTargetNotDead: 0x100, // For targetting dead or undead characters only. (Phoenix Down/Life/etc)
    CanReflect: 0x200, // This ability can be reflected using the Reflect status
    BypassDefense: 0x400, // Piercing damage that ignores the normal damage calculation
    DontAutoRetargetWhenOriginalTargetKilled: 0x800, // The ability should not automatically move to the next viable target if the intended target is no longer viable.
    AlwaysCritical: 0x2000 // This attack is always a critical hit. (Death Blow)
  },
  Elements: {
    Fire: 0x0001,
    Ice: 0x0002,
    Bolt: 0x0004,
    Earth: 0x0008,
    Poison: 0x0010,
    Gravity: 0x0020,
    Water: 0x0040,
    Wind: 0x0080,
    Holy: 0x0100,
    Restorative: 0x0200,
    Cut: 0x0400,
    Hit: 0x0800,
    Punch: 0x1000,
    Shoot: 0x2000,
    Shout: 0x4000,
    Hidden: 0x8000
  },
  MateriaElements: {
    Fire: 0x00,
    Ice: 0x01,
    Bolt: 0x02,
    Earth: 0x03,
    Poison: 0x04,
    Gravity: 0x05,
    Water: 0x06,
    Wind: 0x07,
    Holy: 0x08,
    Restorative: 0x09,
    Cut: 0x0a,
    Hit: 0x0b,
    Punch: 0x0c,
    Shoot: 0x0d,
    Shout: 0x0e,
    Hidden: 0x0f
  },
  Statuses: {
    Death: 1 << 0,
    NearDeath: 1 << 1,
    Sleep: 1 << 2,
    Poison: 1 << 3,
    Sadness: 1 << 4,
    Fury: 1 << 5,
    Confusion: 1 << 6,
    Silence: 1 << 7,
    Haste: 1 << 8,
    Slow: 1 << 9,
    Stop: 1 << 10,
    Frog: 1 << 11,
    Small: 1 << 12,
    SlowNumb: 1 << 13,
    Petrify: 1 << 14,
    Regen: 1 << 15,
    Barrier: 1 << 16,
    MBarrier: 1 << 17,
    Reflect: 1 << 18,
    Dual: 1 << 19,
    Shield: 1 << 20,
    DeathSentence: 1 << 21,
    Manipulate: 1 << 22,
    Berserk: 1 << 23,
    Peerless: 1 << 24,
    Paralysis: 1 << 25,
    Darkness: 1 << 26,
    DualDrain: 1 << 27,
    DeathForce: 1 << 28,
    Resist: 1 << 29,
    LuckyGirl: 1 << 30,
    Imprisoned: 1 << 31
  },

  EquipmentStatus: {
    Death: 0x00,
    NearDeath: 0x01,
    Sleep: 0x02,
    Poison: 0x03,
    Sadness: 0x04,
    Fury: 0x05,
    Confusion: 0x06,
    Silence: 0x07,
    Haste: 0x08,
    Slow: 0x09,
    Stop: 0x0a,
    Frog: 0x0b,
    Small: 0x0c,
    SlowNumb: 0x0d,
    Petrify: 0x0e,
    Regen: 0x0f,
    Barrier: 0x10,
    MBarrier: 0x11,
    Reflect: 0x12,
    Dual: 0x13,
    Shield: 0x14,
    DeathSentence: 0x15,
    Manipulate: 0x16,
    Berserk: 0x17,
    Peerless: 0x18,
    Paralysis: 0x19,
    Darkness: 0x1a,
    DualDrain: 0x1b,
    DeathForce: 0x1c,
    Resist: 0x1d,
    LuckyGirl: 0x1e,
    Imprisoned: 0x1f
  },
  InitialCursorAction: {
    PerformCommandUsingTargetData: 0x00,
    MagicMenu: 0x01,
    SummonMenu: 0x02,
    ItemMenu: 0x03,
    ESkillMenu: 0x04,
    ThrowMenu: 0x05,
    LimitMenu: 0x06,
    EnableTargetSelectionUsingCursor: 0x07,
    WMagicMenu: 0x08,
    WSummonMenu: 0x09,
    WItemMenu: 0x0a,
    CoinMenu: 0x0b
  },
  TargetData: {
    EnableSelection: 0x01, // Cursor will move to the battle field and a target can be selected from valid targets as per additional constraints
    StartCursorOnEnemyRow: 0x02, // Cursor will start on the first enemy row.
    DefaultMultipleTargets: 0x04, // Cursor will select all targets in a given row.
    ToggleSingleMultiTarget: 0x08, // Caster can switch cursor between multiple targets or single targets. (Also indicates if damage will be split among targets)
    SingleRowOnly: 0x10, // Cursor will only target allies or enemies as defined in <see cref="StartCursorOnEnemyRow"/> and cannot be moved from the row.
    ShortRange: 0x20, // If the target or the caster is not in the front of their row, the target will take half damage. For every attack this is enabled, they are constrained by the Binary "Cover Flags"
    AllRows: 0x40, // Cursor will select all viable targets
    RandomTarget: 0x80 // When multiple targets are selected, one will be selected at random to be the receiving target. Cursor will cycle among all viable targets.
  },
  ConditionSubMenu: {
    PartyHP: 0x00,
    PartyMP: 0x01,
    PartyStatus: 0x02,
    None: 0xff
  },
  StatusEffect: {
    ToggleStatus: 0x40,
    RemoveStatus: 0x80
  },
  AccessoryEffect: {
    None: 0xff,
    Haste: 0x0,
    Berserk: 0x1,
    CurseRing: 0x2,
    Reflect: 0x3,
    IncreasedStealingRate: 0x4,
    IncreasedManipulationRate: 0x5,
    Wall: 0x6
  },
  CharacterStat: {
    None: 0xff,
    Strength: 0,
    Vitality: 1,
    Magic: 2,
    Spirit: 3,
    Dexterity: 4,
    Luck: 5,
    HP: 8,
    MP: 9
  },
  DamageModifier: {
    Absorb: 0x0,
    Nullify: 0x1,
    Half: 0x2,
    Normal: 0xff
  },
  EquipableBy: {
    Cloud: 0x0001,
    Barret: 0x0002,
    Tifa: 0x0004,
    Aeris: 0x0008,
    RedXIII: 0x0010,
    Yuffie: 0x0020,
    CaitSith: 0x0040,
    Vincent: 0x0080,
    Cid: 0x0100,
    YoungCloud: 0x0200,
    Sephiroth: 0x0400
  },
  GrowthRate: {
    None: 0,
    Normal: 1,
    Double: 2,
    Triple: 3
  },
  MateriaSlot: {
    None: 0, // No materia slot.
    EmptyUnlinkedSlot: 1, // Unlinked slot without materia growth.
    EmptyLeftLinkedSlot: 2, // Left side of a linked slot without materia growth.
    EmptyRightLinkedSlot: 3, // Right side of a linked slot without materia growth.
    NormalUnlinkedSlot: 5, // Unlinked slot with materia growth.
    NormalLeftLinkedSlot: 6, // Left side of a linked slot with materia growth.
    NormalRightLinkedSlot: 7 // Right side of a linked slot with materia growth.
  },

  Restrictions: {
    CanBeSold: 1,
    CanBeUsedInBattle: 2,
    CanBeUsedInMenu: 4,
    CanBeThrown: 8
  },
  MateriaType: {
    Independent: 'Independent',
    Support: 'Support',
    Magic: 'Magic',
    Summon: 'Summon',
    Command: 'Command'
  },
  CommandType: {
    Steal: 0x5,
    Sense: 0x6,
    Coin: 0x7,
    Throw: 0x8,
    Morph: 0x9,
    'D.Blow': 0xa,
    'Manip.': 0xb,
    Mime: 0xc,
    'E.Skill': 0xd
  },
  SupportType: {
    Counter: 0x54, // 25
    MagicCounter: 0x55,
    SneakAttack: 0x56,
    MPTurbo: 0x58,
    MPAbsorb: 0x59,
    HPAbsorb: 0x5a,
    AddedCut: 0x5c,
    StealAsWell: 0x5d,
    Elemental: 0x5e,
    AddedEffect: 0x5f,
    All: 0x51, // 35
    FinalAttack: 0x57,
    QuadraMagic: 0x63
  },
  Character: {
    Order: {
      BackRow: 0xfe,
      Normal: 0xff
    },
    LearnedLimits: {
      Limit_1_1: 0x0001,
      Limit_1_2: 0x0002,
      Limit_2_1: 0x0008,
      Limit_2_2: 0x0010,
      Limit_3_1: 0x0040,
      Limit_3_2: 0x0080,
      Limit_4: 0x0200
    },
    PartyMember: {
      Cloud: 0x00,
      Barret: 0x01,
      Tifa: 0x02,
      Aeris: 0x03,
      RedXIII: 0x04,
      Yuffie: 0x05,
      CaitSith: 0x06,
      Vincent: 0x07,
      Cid: 0x08,
      YoungCloud: 0x09,
      Sephiroth: 0x0a,
      Chocobo: 0x0b,
      None: 0xfe,
      None: 0xff
    }
  },
  Battle: {
    Location: {
      Blank: 0x0000,
      BizarroBattleCenter: 0x0001,
      Grassland: 0x0002,
      MtNibel: 0x0003,
      Forest: 0x0004,
      Beach: 0x0005,
      Desert: 0x0006,
      Snow: 0x0007,
      Swamp: 0x0008,
      Sector1TrainStation: 0x0009,
      Reactor1: 0x000a,
      Reactor1Core: 0x000b,
      Reactor1Entrance: 0x000c,
      Sector4Subway: 0x000d,
      NibelCavesorAForestCaves: 0x000e,
      ShinraHQ: 0x000f,
      MidgarRaidSubway: 0x0010,
      HojosLab: 0x0011,
      ShinraElevators: 0x0012,
      ShinraRoof: 0x0013,
      MidgarHighway: 0x0014,
      WutaiPagoda: 0x0015,
      Church: 0x0016,
      CoralValley: 0x0017,
      MidgarSlums: 0x0018,
      Sector4CorridorsorJunonPath: 0x0019,
      Sector4GantriesorMidgarUnderground: 0x001a,
      Sector7SupportPillarStairway: 0x001b,
      Sector7SupportPillarTop: 0x001c,
      Sector8: 0x001d,
      Sewers: 0x001e,
      MythrilMines: 0x001f,
      NorthernCraterFloatingPlatforms: 0x0020,
      CorelMountainPath: 0x0021,
      JunonBeach: 0x0022,
      JunonCargoShip: 0x0023,
      CorelPrison: 0x0024,
      BattleSquare: 0x0025,
      DaChaoRappsBattle: 0x0026,
      CidsBackyard: 0x0027,
      FinalDescenttoSephiroth: 0x0028,
      Reactor5Entrance: 0x0029,
      TempleOfTheAncientsEscherRoom: 0x002a,
      ShinraMansion: 0x002b,
      JunonAirshipDock: 0x002c,
      WhirlwindMaze: 0x002d,
      JunonUnderwaterReactor: 0x002e,
      GongagaReactor: 0x002f,
      Gelnika: 0x0030,
      TrainGraveyard: 0x0031,
      GreatGlacierIceCavesOrGaeaCliffsInside: 0x0032,
      SisterRay: 0x0033,
      SisterRayBase: 0x0034,
      ForgottenCityAltar: 0x0035,
      NorthernCraterInitialDescent: 0x0036,
      NorthernCraterHatchery: 0x0037,
      NorthernCraterWaterArea: 0x0038,
      SaferBattle: 0x0039,
      KalmFlashbackDragonBattle: 0x003a,
      JunonUnderwaterPipe: 0x003b,
      Blank2: 0x003c,
      CorelRailwayCanyon: 0x003d,
      WhirlwindMazeCrater: 0x003e,
      CorelRailwayRollercoaster: 0x003f,
      WoodenBridge: 0x0040,
      DaChao: 0x0041,
      FortCondor: 0x0042,
      DirtWasteland: 0x0043,
      BizarroBattleRightSide: 0x0044,
      BizarroBattleLeftSide: 0x0045,
      JenovaSynthesisBattle: 0x0046,
      CorelTrainBattle: 0x0047,
      CosmoCanyon: 0x0048,
      CavernsOfTheGi: 0x0049,
      NibelheimMansionBasement: 0x004a,
      TempleOfTheAncientsDemonsGate: 0x004b,
      TempleOfTheAncientsMuralRoom: 0x004c,
      TempleOfTheAncientsClockPassage: 0x004d,
      FinalBattleSephiroth: 0x004e,
      Jungle: 0x004f,
      UltimateWeaponHighwind: 0x0050,
      CorelReactor: 0x0051,
      Unused: 0x0052,
      DonCorneosMansion: 0x0053,
      EmeraldWeaponBattle: 0x0054,
      Reactor5: 0x0055,
      ShinraHQEscape: 0x0056,
      UltimateWeaponGongagaReactor: 0x0057,
      CorelPrisonDyneBattle: 0x0058,
      UltimateWeaponForest: 0x0059
    },
    Layout: {
      Normal: 0x00,
      Preemptive: 0x01,
      BackAttack: 0x02,
      SideAttack1: 0x03,
      PincerAttack: 0x04,
      SideAttack2: 0x05,
      SideAttack3: 0x06,
      SideAttack4: 0x07,
      NormalLockFrontRow: 0x08
    },
    InitialConditionFlags: {
      Visible: 0x0001,
      SideAttackInitialDirection: 0x0002,
      Unknown: 0x0004,
      Targetable: 0x0010,
      MainScriptActive: 0x0008
    },
    BattleFlags: {
      Unknown: 0b10, // This is popular
      CantEscape: 0b100,
      NoVictoryPoses: 0b1000,
      NoPremptive: 0b10000
    },
    ElementRates: {
      Death: 0x00,
      DoubleDamage: 0x02,
      HalfDamange: 0x04,
      NullifyDamage: 0x05,
      Absorb: 0x06,
      FullCure: 0x07,
      Nothing: 0xff
    }
  },
  Attack: {
    DamageType: {
      Physical: 'Physical',
      Magical: 'Magical'
    },
    AccuracyCalc: {
      NeverMiss: 'NeverMiss',
      UseAccuracyStat: 'UseAccuracyStat',
      TargetLevel: 'TargetLevel',
      ManipulateFormula: 'ManipulateFormula'
    },
    DamageBoost: {
      DamageStatus: 'DamageStatus',
      DamageNearDeath: 'DamageNearDeath',
      DamageDeadAllies: 'DamageDeadAllies',

      PowerTargetLevel: 'PowerTargetLevel',
      PowerHP: 'PowerHP',
      PowerMP: 'PowerMP',
      PowerAP: 'PowerAP',
      PowerKills: 'PowerKills',
      PowerLimit: 'PowerLimit'
    },
    DamageFormula: {
      NoDamage: 'NoDamage',
      PowerD16SLSLS: 'Power16SLSLS',
      PowerD16LS: 'Power16LS',
      PowerCurrentHP: 'PowerCurrentHP',
      PowerMaxHP: 'PowerMaxHP',
      PowerX22LS: 'Power22LS',
      PowerX20: 'PowerX20',
      PowerD32: 'PowerD32',
      Recovery: 'Recovery',
      Throw: 'Throw',
      Coin: 'Coin',
      //
      CurrentHP: 'CurrentHP',
      HPDiff: 'HPDiff',
      Dice: 'Dice',
      Escapes: 'Escapes',
      TargetHP: 'TargetHP',
      Hours: 'Hours',
      Kills: 'Kills',
      Materia: 'Materia'
    }
  },
  Slots: {
    Tifa: {
      Miss: 0x00,
      Hit: 0x01,
      Yeah: 0x02
    },
    CaitSith: {
      CaitSith: 0x00,
      Bar: 0x01,
      Crown: 0x02,
      Heart: 0x03,
      Star: 0x04,
      Moogle: 0x05
    }
  }
}

window.Enums = Enums
export { Enums }
