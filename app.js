/**
 * 『逢曲時 帳場録（おうまがとき ちょうばろく）』メインゲームロジック
 * ― 彼岸旅館「逢曲時」おうまがとき 世界観準拠版 ―
 */

(() => {
  "use strict";

  const DATA = window.GAME_DATA;

  // 漢数字表記用（全五夜）
  const NIGHT_LABELS = ["第一夜", "第二夜", "第三夜", "第四夜", "第五夜"];

  // ゲーム状態管理
  const state = {
    night: 1, // 1〜5
    phase: "assign", // 'assign' | 'resolving' | 'modal'
    reputation: DATA.config.initialReputation, // 評判
    spirit: DATA.config.initialSpirit,         // 雅（みやび）
    selectedCastId: null,     // クリック選択中の誘魅ID
    handCastIds: [],          // 今夜の手札として配られた4名の誘魅ID配列
    bellUsedThisNight: false, // 今夜「帳場の呼び鈴（手札入替）」を使用したか
    roomState: {},            // { [roomId]: { visitor, assignedCastId, result } }
    castCooldowns: {},        // { [castId]: remainingTurns }（1ターン休み管理）
    castStats: {},            // { [castId]: { successCount: 0, deployCount: 0 } }
    totalSuccessCount: 0      // 全五夜を通じた「おもてなし成功数」（最大15室）
  };

  // DOM要素キャッシュ
  const dom = {
    nightCount: document.getElementById("night-count"),
    nightTotal: document.getElementById("night-total"),
    phaseDusk: document.getElementById("phase-dusk"),
    phaseOumaga: document.getElementById("phase-oumaga"),
    phaseMidnight: document.getElementById("phase-midnight"),
    reputationNum: document.getElementById("reputation-num"),
    reputationTokens: document.getElementById("reputation-tokens"),
    spiritNum: document.getElementById("spirit-num"),
    spiritTokens: document.getElementById("spirit-tokens"),
    statusReputation: document.getElementById("status-reputation"),
    statusSpirit: document.getElementById("status-spirit"),
    gameLog: document.getElementById("game-log"),
    roomsGrid: document.getElementById("rooms-grid"),
    castHand: document.getElementById("cast-hand"),
    deckStatusBadge: document.getElementById("deck-status-badge"),
    selectionHint: document.getElementById("selection-hint"),
    btnBellRedraw: document.getElementById("btn-bell-redraw"),
    btnClearAssign: document.getElementById("btn-clear-assign"),
    btnResolveNight: document.getElementById("btn-resolve-night"),
    resultModal: document.getElementById("result-modal"),
    modalWatermark: document.getElementById("modal-watermark"),
    modalSubtitle: document.getElementById("modal-subtitle"),
    modalTitle: document.getElementById("modal-title"),
    modalBody: document.getElementById("modal-body"),
    modalStatsSummary: document.getElementById("modal-stats-summary"),
    btnModalNext: document.getElementById("btn-modal-next"),
    // 豪華リザルト画面（帳場日報：エンディング3分岐）用DOM
    endingModal: document.getElementById("ending-modal"),
    endingFxLayer: document.getElementById("ending-fx-layer"),
    endingScrollCard: document.getElementById("ending-scroll-card"),
    endingWatermark: document.getElementById("ending-watermark"),
    endingRankBadge: document.getElementById("ending-rank-badge"),
    endingSealStamp: document.getElementById("ending-seal-stamp"),
    endingTitle: document.getElementById("ending-title"),
    endingDescription: document.getElementById("ending-description"),
    endingScoreRep: document.getElementById("ending-score-rep"),
    endingScoreRepStars: document.getElementById("ending-score-rep-stars"),
    endingScoreSpirit: document.getElementById("ending-score-spirit"),
    endingScoreSpiritGems: document.getElementById("ending-score-spirit-gems"),
    endingScoreRooms: document.getElementById("ending-score-rooms"),
    endingScoreRoomsSub: document.getElementById("ending-score-rooms-sub"),
    endingMvpCard: document.getElementById("ending-mvp-card"),
    endingMvpTitle: document.getElementById("ending-mvp-title"),
    endingMvpSpeaker: document.getElementById("ending-mvp-speaker"),
    endingMvpQuote: document.getElementById("ending-mvp-quote"),
    btnEndingRetry: document.getElementById("btn-ending-retry"),
    btnEndingShare: document.getElementById("btn-ending-share"),
    debugEndingBar: document.getElementById("debug-ending-bar"),
    btnHelp: document.getElementById("btn-help"),
    helpModal: document.getElementById("help-modal"),
    btnCloseHelp: document.getElementById("btn-close-help"),
    // 世界観モーダル用DOM
    btnWorld: document.getElementById("btn-world"),
    btnTitleWorld: document.getElementById("btn-title-world"),
    worldModal: document.getElementById("world-modal"),
    worldLoreContainer: document.getElementById("world-lore-container"),
    btnCloseWorld: document.getElementById("btn-close-world"),
    bgCanvas: document.getElementById("bg-canvas"),
    // カットイン会話ウィンドウ用DOM
    cutinOverlay: document.getElementById("cutin-overlay"),
    cutinBgKanji: document.getElementById("cutin-bg-kanji"),
    cutinRoomTag: document.getElementById("cutin-room-tag"),
    cutinRewardBadge: document.getElementById("cutin-reward-badge"),
    cutinCastBox: document.getElementById("cutin-cast-box"),
    cutinVisitorBox: document.getElementById("cutin-visitor-box"),
    cutinCastSpeaker: document.getElementById("cutin-cast-speaker"),
    cutinCastLine: document.getElementById("cutin-cast-line"),
    cutinVisitorSpeaker: document.getElementById("cutin-visitor-speaker"),
    cutinVisitorLine: document.getElementById("cutin-visitor-line"),
    cutinNarration: document.getElementById("cutin-narration"),
    btnCutinNext: document.getElementById("btn-cutin-next"),
    // タイトル画面＆開帳前遊び方画面用DOM
    titleScreen: document.getElementById("title-screen"),
    introScreen: document.getElementById("intro-screen"),
    btnTitleStart: document.getElementById("btn-title-start"),
    btnIntroBack: document.getElementById("btn-intro-back"),
    btnIntroPlay: document.getElementById("btn-intro-play")
  };

  /* ==========================================================================
     初期化＆ゲームサイクル制御
     ========================================================================== */
  function initGame() {
    state.night = 1;
    state.reputation = DATA.config.initialReputation;
    state.spirit = DATA.config.initialSpirit;
    state.selectedCastId = null;
    state.handCastIds = [];
    state.bellUsedThisNight = false;
    state.castCooldowns = {};
    state.castStats = {};
    state.totalSuccessCount = 0;

    DATA.casts.forEach((c) => {
      state.castCooldowns[c.id] = 0;
      state.castStats[c.id] = {
        successCount: 0,
        deployCount: 0
      };
    });

    if (dom.endingModal) {
      dom.endingModal.classList.add("hidden");
    }
    if (dom.resultModal) {
      dom.resultModal.classList.add("hidden");
    }

    if (dom.nightTotal) {
      dom.nightTotal.textContent = `/ 全${NIGHT_LABELS[DATA.config.maxNights - 1]?.replace("第", "") || "五夜"}`;
    }

    dom.gameLog.innerHTML = "";
    addLog("八つ槌車の提灯に火が灯り、彼岸旅館『逢曲時』が開帳しました。迷い込んだ魂を神楽で鎮め、“黄泉平坂”より現世へ送り還しましょう。");

    startNight(1);
  }

  /**
   * 世界観（WORLD）モーダルの内容を構築
   */
  function renderWorldLoreModal() {
    if (!dom.worldLoreContainer || !Array.isArray(DATA.worldLore)) return;
    dom.worldLoreContainer.innerHTML = DATA.worldLore
      .map(
        (item) => `
        <article class="world-lore-card">
          <div class="world-lore-header">
            <h3 class="world-lore-title">${escapeHtml(item.title)}</h3>
            <span class="world-lore-sub">${escapeHtml(item.subtitle || "")}</span>
          </div>
          <p class="world-lore-text">${item.body}</p>
        </article>
      `
      )
      .join("");
  }

  /**
   * 来訪者の要求リストを正規化して取得（単一要求・複合要求の双方に対応）
   */
  function getVisitorRequirements(visitor) {
    if (Array.isArray(visitor.requirements) && visitor.requirements.length > 0) {
      return visitor.requirements;
    }
    return [{ stat: visitor.requiredStat, value: visitor.requiredValue }];
  }

  /**
   * 夜の進行度に応じた重み付けで来訪者（迷い人）を3部屋分抽選する
   */
  function drawVisitorsForNight(nightNumber) {
    const candidates = [...DATA.visitors];
    const selected = [];

    for (let i = 0; i < DATA.rooms.length; i++) {
      if (candidates.length === 0) break;

      const weights = candidates.map((v) => {
        const tier = v.tier || "early";
        if (nightNumber <= 2) {
          if (tier === "early") return 6;
          if (tier === "mid") return 3;
          return 0.6; // high
        } else if (nightNumber <= 4) {
          if (tier === "early") return 2.5;
          if (tier === "mid") return 4;
          return 4.5; // high
        } else {
          if (tier === "early") return 1.5;
          if (tier === "mid") return 3.5;
          return 6; // high
        }
      });

      const totalWeight = weights.reduce((acc, w) => acc + w, 0);
      let r = Math.random() * totalWeight;
      let pickedIndex = 0;

      for (let j = 0; j < candidates.length; j++) {
        r -= weights[j];
        if (r <= 0) {
          pickedIndex = j;
          break;
        }
      }

      selected.push(candidates[pickedIndex]);
      candidates.splice(pickedIndex, 1);
    }

    return selected;
  }

  /**
   * 山札（全8名）から「1ターン休み」の誘魅を除外し、ランダムで手札（4名）をドローする
   */
  function drawInitialHand() {
    const availablePool = DATA.casts.filter((c) => (state.castCooldowns[c.id] || 0) <= 0);
    shuffleArray(availablePool);
    const count = Math.min(DATA.config.handSize || 4, availablePool.length);
    state.handCastIds = availablePool.slice(0, count).map((c) => c.id);
  }

  /**
   * 手札事故防止システム「帳場の呼び鈴（手札入替）」
   */
  function useBellRedraw() {
    if (state.phase !== "assign") return;
    if (state.bellUsedThisNight) {
      addLog("「帳場の呼び鈴」は一夜につき一度しか鳴らせません。");
      return;
    }

    const cost = DATA.config.bellSpiritCost || 1;
    if (state.spirit <= cost) {
      addLog("『雅』が残り少ないため、これ以上呼び鈴を鳴らすことはできません（雅2以上で使用可能）。");
      return;
    }

    const assignedIds = new Set(
      Object.values(state.roomState)
        .map((r) => r.assignedCastId)
        .filter(Boolean)
    );

    const unplacedHandIds = state.handCastIds.filter((id) => !assignedIds.has(id));
    if (unplacedHandIds.length === 0) {
      addLog("すべての手札がお座敷へ配置されているため、入れ替える待機中の誘魅（いざなみ）がいません。");
      return;
    }

    // 雅を1消費
    applyStatusDelta(0, -cost);
    state.bellUsedThisNight = true;
    state.selectedCastId = null;

    const allEligibleIds = DATA.casts
      .filter((c) => (state.castCooldowns[c.id] || 0) <= 0 && !assignedIds.has(c.id))
      .map((c) => c.id);

    const outsideHandPool = allEligibleIds.filter((id) => !unplacedHandIds.includes(id));
    const returnedPool = allEligibleIds.filter((id) => unplacedHandIds.includes(id));
    shuffleArray(outsideHandPool);
    shuffleArray(returnedPool);

    const combinedPool = [...outsideHandPool, ...returnedPool];
    const neededCount = (DATA.config.handSize || 4) - assignedIds.size;
    const newlyDrawnIds = combinedPool.slice(0, neededCount);

    state.handCastIds = [...Array.from(assignedIds), ...newlyDrawnIds];

    const drawnNames = newlyDrawnIds
      .map((id) => DATA.casts.find((c) => c.id === id)?.name)
      .filter(Boolean)
      .join("・");

    addLog(`🔔 帳場の呼び鈴を鳴らし（雅-${cost}）、待機中の誘魅を入れ替えました！（新着：${drawnNames}）`);
    renderAll();
  }

  /**
   * 宵の口〜逢曲時フェーズ開始
   */
  function startNight(nightNumber) {
    state.night = nightNumber;
    state.phase = "assign";
    state.selectedCastId = null;
    state.bellUsedThisNight = false;
    state.roomState = {};

    setPhaseIndicator("dusk");

    // 1. 来訪者を夜の重み付けテーブルで3つのお座敷に配置
    const drawnVisitors = drawVisitorsForNight(nightNumber);
    DATA.rooms.forEach((room, idx) => {
      state.roomState[room.id] = {
        visitor: drawnVisitors[idx],
        assignedCastId: null,
        result: null
      };
    });

    // 2. 山札（休み除外）からランダムで4名をドロー
    drawInitialHand();

    const nightLabel = NIGHT_LABELS[nightNumber - 1] || `第${nightNumber}夜`;
    const restingNames = DATA.casts
      .filter((c) => (state.castCooldowns[c.id] || 0) > 0)
      .map((c) => c.name);
    const restText = restingNames.length > 0 ? `（今宵休み：${restingNames.join("・")}）` : "";

    addLog(`―― 【${nightLabel}・宵の口】現世から迷い込んだ三組の客人が見えられ、待機の誘魅巫女4名が帳場へ揃いました。${restText}`);

    updateStatusUI();
    renderAll();

    // 少し間を置いて「逢曲時（配置フェーズ）」へハイライト移動
    setTimeout(() => {
      if (state.phase === "assign") {
        setPhaseIndicator("oumaga");
      }
    }, 450);
  }

  /* ==========================================================================
     計算・判定ロジック（複合要求＆固有パッシブ効果対応）
     ========================================================================== */

  function evaluateAssignment(room, visitor, cast) {
    const reqs = getVisitorRequirements(visitor);

    const checks = reqs.map((req) => {
      const statKey = req.stat;
      const reqVal = req.value;
      const statMeta = DATA.statsMeta[statKey];

      if (!cast) {
        return {
          stat: statKey,
          statName: statMeta.name,
          statIcon: statMeta.icon || "",
          baseVal: 0,
          roomBonus: 0,
          affinityBonus: 0,
          totalVal: 0,
          reqVal,
          passed: false
        };
      }

      const baseVal = cast.stats[statKey] || 0;
      let roomBonus = 0;
      let affinityBonus = 0;

      if (room.bonusStat === statKey) {
        if (cast.passiveType === "room_bonus_override") {
          roomBonus = cast.passiveValue || 3;
        } else {
          roomBonus = room.bonusValue || 1;
          if (room.affinityCastId === cast.id) {
            affinityBonus = room.affinityBonusValue || 1;
          }
        }
      }

      const totalVal = baseVal + roomBonus + affinityBonus;
      const passed = totalVal >= reqVal;

      return {
        stat: statKey,
        statName: statMeta.name,
        statIcon: statMeta.icon || "",
        baseVal,
        roomBonus,
        affinityBonus,
        totalVal,
        reqVal,
        passed
      };
    });

    const isSuccess = Boolean(cast) && checks.every((c) => c.passed);

    let deltaRep = isSuccess ? (visitor.reward.reputation || 0) : (visitor.penalty.reputation || 0);
    let deltaSpi = isSuccess ? (visitor.reward.spirit || 0) : (visitor.penalty.spirit || 0);
    const passiveNotes = [];

    if (cast) {
      if (isSuccess) {
        if (cast.passiveType === "bonus_reputation_on_success") {
          const addRep = cast.passiveValue || 1;
          deltaRep += addRep;
          passiveNotes.push(`${cast.name}効果：評判+${addRep}`);
        } else if (cast.passiveType === "bonus_spirit_on_success") {
          const addSpi = cast.passiveValue || 1;
          deltaSpi += addSpi;
          passiveNotes.push(`${cast.name}効果：雅+${addSpi}`);
        }
      } else {
        if (cast.passiveType === "reduce_penalty_on_fail") {
          const reduceVal = cast.passiveValue || 1;
          let reduced = false;
          if (deltaRep < 0) {
            deltaRep = Math.min(0, deltaRep + reduceVal);
            reduced = true;
          }
          if (deltaSpi < 0) {
            deltaSpi = Math.min(0, deltaSpi + reduceVal);
            reduced = true;
          }
          if (reduced) {
            passiveNotes.push(`${cast.name}効果：ペナルティ-${reduceVal}軽減`);
          }
        }
      }
    }

    return {
      checks,
      isSuccess,
      deltaRep,
      deltaSpi,
      passiveNotes
    };
  }

  function isCastCurrentlyAssigned(castId) {
    return Object.values(state.roomState).some((r) => r.assignedCastId === castId);
  }

  function assignCastToRoom(castId, roomId) {
    if (state.phase !== "assign") return;
    if (!state.handCastIds.includes(castId)) return;

    const cast = DATA.casts.find((c) => c.id === castId);
    if (!cast) return;

    const targetRoomState = state.roomState[roomId];
    if (!targetRoomState) return;

    if (targetRoomState.assignedCastId === castId) {
      state.selectedCastId = null;
      renderAll();
      return;
    }

    const wasAlreadyAssignedElsewhere = isCastCurrentlyAssigned(castId);
    const prevCastInTargetRoom = targetRoomState.assignedCastId
      ? DATA.casts.find((c) => c.id === targetRoomState.assignedCastId)
      : null;

    const costToPay = !wasAlreadyAssignedElsewhere ? (cast.deploySpiritCost || 0) : 0;
    const refundFromPrev = prevCastInTargetRoom ? (prevCastInTargetRoom.deploySpiritCost || 0) : 0;
    const netSpiritChange = refundFromPrev - costToPay;

    if (state.spirit + netSpiritChange <= 0) {
      addLog(
        `⚠️ 「${cast.fullName}」は格式が高いため、配置に『雅』を${costToPay}消費します（現在の雅が1以下のため配置できません）。`,
        "log-fail"
      );
      state.selectedCastId = null;
      renderAll();
      return;
    }

    if (prevCastInTargetRoom) {
      targetRoomState.assignedCastId = null;
      if (refundFromPrev > 0) {
        applyStatusDelta(0, refundFromPrev);
        addLog(`「${prevCastInTargetRoom.fullName}」の配置を解き、『雅』が +${refundFromPrev} 返却されました。`);
      }
    }

    Object.keys(state.roomState).forEach((rId) => {
      if (state.roomState[rId].assignedCastId === castId) {
        state.roomState[rId].assignedCastId = null;
      }
    });

    targetRoomState.assignedCastId = castId;
    if (costToPay > 0) {
      applyStatusDelta(0, -costToPay);
      const roomObj = DATA.rooms.find((r) => r.id === roomId);
      addLog(`✨ 【女将の威光】八つ槌車を背負う「${cast.fullName}」を${roomObj ? roomObj.name : "お座敷"}へ配置しました（雅-${costToPay}）。`);
    }

    state.selectedCastId = null;
    renderAll();
  }

  function unassignRoom(roomId) {
    if (state.phase !== "assign") return;
    const rState = state.roomState[roomId];
    if (rState && rState.assignedCastId) {
      const removedCast = DATA.casts.find((c) => c.id === rState.assignedCastId);
      rState.assignedCastId = null;

      if (removedCast && (removedCast.deploySpiritCost || 0) > 0) {
        const refund = removedCast.deploySpiritCost;
        applyStatusDelta(0, refund);
        addLog(`「${removedCast.fullName}」を手札へ戻し、『雅』が +${refund} 返却されました。`);
      }
      renderAll();
    }
  }

  function clearAllAssignments() {
    if (state.phase !== "assign") return;
    let totalRefund = 0;
    const refundedNames = [];

    Object.keys(state.roomState).forEach((roomId) => {
      const cId = state.roomState[roomId].assignedCastId;
      if (cId) {
        const c = DATA.casts.find((item) => item.id === cId);
        if (c && (c.deploySpiritCost || 0) > 0) {
          totalRefund += c.deploySpiritCost;
          refundedNames.push(c.fullName);
        }
        state.roomState[roomId].assignedCastId = null;
      }
    });

    if (totalRefund > 0) {
      applyStatusDelta(0, totalRefund);
      addLog(`${refundedNames.join("・")}の配置を戻し、『雅』が +${totalRefund} 返却されました。`);
    }

    state.selectedCastId = null;
    renderAll();
  }

  /* ==========================================================================
     黄泉平坂（解決フェーズ）アニメーション進行
     ========================================================================== */
  async function resolveNight() {
    if (state.phase !== "assign") return;
    state.phase = "resolving";
    state.selectedCastId = null;
    setPhaseIndicator("midnight");
    renderAll();

    const nightLabel = NIGHT_LABELS[state.night - 1] || `第${state.night}夜`;
    addLog(`―― 【${nightLabel}・神楽の刻】誘魅たちの神楽による魂鎮めと“黄泉平坂”への送り還し判定を開始します。`);

    const usedCastIdsThisNight = new Set();

    for (let i = 0; i < DATA.rooms.length; i++) {
      const room = DATA.rooms[i];
      const rState = state.roomState[room.id];
      const visitor = rState.visitor;
      const cast = DATA.casts.find((c) => c.id === rState.assignedCastId) || null;

      if (cast) {
        usedCastIdsThisNight.add(cast.id);
        if (!state.castStats[cast.id]) {
          state.castStats[cast.id] = { successCount: 0, deployCount: 0 };
        }
        state.castStats[cast.id].deployCount += 1;
      }

      await sleep(420);

      const evalResult = evaluateAssignment(room, visitor, cast);
      const { isSuccess, deltaRep, deltaSpi, passiveNotes, checks } = evalResult;

      if (isSuccess) {
        state.totalSuccessCount += 1;
        if (cast) {
          state.castStats[cast.id].successCount += 1;
        }
      }

      rState.result = {
        isSuccess,
        evalResult,
        deltaRep,
        deltaSpi,
        passiveNotes,
        flavor: isSuccess ? visitor.successFlavor : visitor.failFlavor
      };

      if (isSuccess && cast) {
        await showHospitalityCutin(room, visitor, cast, deltaRep, deltaSpi, passiveNotes);
      }

      applyStatusDelta(deltaRep, deltaSpi);

      const checkSummary = checks
        .map((c) => `${c.statName}${c.totalVal}/${c.reqVal}`)
        .join("・");
      const passiveSuffix = passiveNotes.length > 0 ? ` ［${passiveNotes.join(" / ")}］` : "";

      if (isSuccess) {
        addLog(
          `【${room.name}】${cast.fullName}の神楽成就！ 「${visitor.name}」の魂は安定し、黄泉平坂より現世へ還った（${checkSummary}） ${formatDeltaText(deltaRep, deltaSpi)}${passiveSuffix}`,
          "log-success"
        );
      } else {
        const castLabel = cast ? cast.fullName : "未配置";
        addLog(
          `【${room.name}】鎮魂ならず…「${visitor.name}」はヨモツヘグイの誘惑に当てられ常世の闇へ惹かれた（${castLabel}: ${checkSummary}） ${formatDeltaText(deltaRep, deltaSpi)}${passiveSuffix}`,
          "log-fail"
        );
      }

      renderRooms();

      await sleep(750);

      if (state.reputation <= 0 || state.spirit <= 0) {
        break;
      }
    }

    await sleep(600);

    // 途中で「評判」または「雅」が0になった場合はバッドエンド（営業終了）
    if (state.reputation <= 0 || state.spirit <= 0) {
      showEndingScreen("bad");
      return;
    }

    // 第5夜終了時は「評判＋雅」の合計値（8以上＝トゥルー／7以下＝ノーマル）で分岐
    if (state.night >= DATA.config.maxNights) {
      const totalScore = state.reputation + state.spirit;
      const endingType = totalScore >= 8 ? "true" : "normal";
      showEndingScreen(endingType);
      return;
    }

    DATA.casts.forEach((cast) => {
      if (usedCastIdsThisNight.has(cast.id) && cast.cooldownTurns > 0) {
        state.castCooldowns[cast.id] = cast.cooldownTurns;
      } else if ((state.castCooldowns[cast.id] || 0) > 0) {
        state.castCooldowns[cast.id] = Math.max(0, state.castCooldowns[cast.id] - 1);
      }
    });

    showDawnModal();
  }

  function applyStatusDelta(deltaRep, deltaSpi) {
    const prevRep = state.reputation;
    const prevSpi = state.spirit;

    state.reputation = Math.max(0, Math.min(DATA.config.maxReputation, state.reputation + deltaRep));
    state.spirit = Math.max(0, Math.min(DATA.config.maxSpirit, state.spirit + deltaSpi));

    updateStatusUI(state.reputation - prevRep, state.spirit - prevSpi);
  }

  /**
   * おもてなし成功（鎮魂・黄泉平坂送り還し）時の画面中央カットイン会話ウィンドウ
   */
  function showHospitalityCutin(room, visitor, cast, deltaRep, deltaSpi, passiveNotes = []) {
    return new Promise((resolve) => {
      const castDialogues = DATA.hospitalityDialogues?.[cast.id];
      const scene = castDialogues?.byVisitor?.[visitor.id] || {
        castLine: castDialogues?.defaultCastLine || cast.quote || "「神楽の芸にて、貴方の魂を現世へと送り還しましょう」",
        visitorLine: "「不思議なほど心が静まり、現世へ還る道が見えてきた……ありがとう、逢曲時の誘魅どの！」",
        narration: visitor.successFlavor
      };

      dom.cutinBgKanji.textContent = cast.kanjiWatermark || "還";
      dom.cutinRoomTag.textContent = room.name;

      const rewardText = formatStake({ reputation: deltaRep, spirit: deltaSpi }, true);
      const passiveBadge = passiveNotes.length > 0 ? `（${passiveNotes.join("・")}）` : "";
      dom.cutinRewardBadge.textContent = `獲得：${rewardText}${passiveBadge}`;

      const safeCastImg = (cast.imagePath || "").trim();
      const castImgTag = safeCastImg
        ? `<img src="${escapeHtml(safeCastImg)}" alt="${escapeHtml(cast.fullName)}" class="card-real-img" onload="this.parentElement.classList.add('has-loaded-img')" onerror="this.remove()">`
        : "";
      dom.cutinCastBox.innerHTML = `
        <div class="cutin-portrait-frame" style="background: radial-gradient(circle at 50% 45%, ${cast.accentColor}66, #0d0c12)">
          ${castImgTag}
          <span class="cutin-portrait-kanji">${escapeHtml(cast.kanjiWatermark)}</span>
          <span class="cutin-portrait-caption">${escapeHtml(cast.fullName)}</span>
        </div>
      `;

      dom.cutinCastSpeaker.textContent = `【${cast.fullName}】`;
      dom.cutinCastLine.textContent = scene.castLine;

      dom.cutinVisitorSpeaker.textContent = `【${visitor.name}】`;
      dom.cutinVisitorLine.textContent = scene.visitorLine;

      dom.cutinNarration.textContent = scene.narration || visitor.successFlavor;

      dom.cutinOverlay.classList.remove("hidden");

      const closeCutin = (e) => {
        if (e) e.stopPropagation();
        dom.cutinOverlay.classList.add("hidden");
        dom.cutinOverlay.onclick = null;
        dom.btnCutinNext.onclick = null;
        resolve();
      };

      dom.cutinOverlay.onclick = closeCutin;
      dom.btnCutinNext.onclick = closeCutin;
    });
  }

  /* ==========================================================================
     UI描画＆画像フォールバック付きプレースホルダー
     ========================================================================== */

  function renderAll() {
    renderRooms();
    renderCastHand();
    updateControlButtons();
  }

  function updateStatusUI(repDiff = 0, spiDiff = 0) {
    const nightLabel = NIGHT_LABELS[state.night - 1] || `第${state.night}夜`;
    dom.nightCount.textContent = nightLabel;

    dom.reputationNum.textContent = state.reputation;
    dom.spiritNum.textContent = state.spirit;

    dom.reputationTokens.innerHTML = "";
    for (let i = 0; i < DATA.config.maxReputation; i++) {
      const pip = document.createElement("span");
      pip.className = `token-pip reputation ${i < state.reputation ? "active" : ""}`;
      dom.reputationTokens.appendChild(pip);
    }

    dom.spiritTokens.innerHTML = "";
    for (let i = 0; i < DATA.config.maxSpirit; i++) {
      const pip = document.createElement("span");
      pip.className = `token-pip spirit ${i < state.spirit ? "active" : ""}`;
      dom.spiritTokens.appendChild(pip);
    }

    if (repDiff !== 0) {
      triggerAnimClass(dom.statusReputation, repDiff > 0 ? "status-pulse-up" : "status-pulse-down");
    }
    if (spiDiff !== 0) {
      triggerAnimClass(dom.statusSpirit, spiDiff > 0 ? "status-pulse-up" : "status-pulse-down");
    }
  }

  function setPhaseIndicator(phaseKey) {
    dom.phaseDusk?.classList.toggle("active", phaseKey === "dusk");
    dom.phaseOumaga?.classList.toggle("active", phaseKey === "oumaga");
    dom.phaseMidnight?.classList.toggle("active", phaseKey === "midnight");
  }

  /**
   * 3つのお座敷エリアを描画
   */
  function renderRooms() {
    dom.roomsGrid.innerHTML = "";

    DATA.rooms.forEach((room) => {
      const rState = state.roomState[room.id];
      const visitor = rState.visitor;
      const assignedCast = DATA.casts.find((c) => c.id === rState.assignedCastId) || null;
      const roomBonusMeta = DATA.statsMeta[room.bonusStat];
      const affinityCast = DATA.casts.find((c) => c.id === room.affinityCastId);
      const reqs = getVisitorRequirements(visitor);

      const col = document.createElement("section");
      col.className = "room-column";
      if (state.phase === "assign" && state.selectedCastId) {
        col.classList.add("selectable-target");
      }
      col.dataset.roomId = room.id;

      const reqBadgesHTML = reqs
        .map((r) => {
          const m = DATA.statsMeta[r.stat];
          return `<span class="visitor-req-badge stat-bg-${r.stat}">${m.icon || ""}【${m.name}】${r.value}</span>`;
        })
        .join("");

      const rewardStr = formatStake(visitor.reward, true);
      const penaltyStr = formatStake(visitor.penalty, false);

      let slotInnerHTML = "";
      if (assignedCast) {
        const evalPreview = evaluateAssignment(room, visitor, assignedCast);

        const breakdownItemsHTML = evalPreview.checks
          .map((chk) => {
            const bonusSum = chk.roomBonus + chk.affinityBonus;
            const bonusTag =
              bonusSum > 0
                ? `<span class="calc-bonus-highlight">+${bonusSum}</span>`
                : "";
            const mark = chk.passed ? "○" : "×";
            return `<span>${chk.statIcon}${chk.statName}<strong>${chk.baseVal}</strong>${bonusTag}＝<strong>${chk.totalVal}</strong>/${chk.reqVal}(${mark})</span>`;
          })
          .join(" ／ ");

        const passiveHint =
          evalPreview.passiveNotes.length > 0
            ? `<div class="calc-passive-hint">★${escapeHtml(evalPreview.passiveNotes.join("・"))}</div>`
            : "";

        const unassignLabel =
          (assignedCast.deploySpiritCost || 0) > 0
            ? `外す（雅+${assignedCast.deploySpiritCost}）`
            : "外す";

        const safeAssignedImg = (assignedCast.imagePath || "").trim();
        const assignedImgHTML = safeAssignedImg
          ? `<img src="${escapeHtml(safeAssignedImg)}" alt="${escapeHtml(assignedCast.fullName)}" class="card-real-img" onload="this.parentElement.classList.add('has-loaded-img')" onerror="this.remove()">`
          : "";

        slotInnerHTML = `
          <div class="assigned-cast-view">
            <div class="assigned-portrait" style="background: radial-gradient(circle at 50% 45%, ${assignedCast.accentColor}66, #0d0c12)">
              ${assignedImgHTML}
              <span class="assigned-portrait-kanji">${escapeHtml(assignedCast.kanjiWatermark)}</span>
            </div>
            <div class="assigned-cast-main">
              <div class="assigned-cast-top">
                <div class="assigned-cast-name">${escapeHtml(assignedCast.fullName)}</div>
                ${
                  state.phase === "assign"
                    ? `<button type="button" class="btn-unassign" data-unassign-room="${room.id}">${unassignLabel}</button>`
                    : ""
                }
              </div>
              <div class="calc-preview">
                <div class="calc-breakdown">
                  ${breakdownItemsHTML}
                  ${passiveHint}
                </div>
                <span class="calc-verdict ${evalPreview.isSuccess ? "ok" : "ng"}">
                  ${evalPreview.isSuccess ? "鎮魂見込" : "神楽不足"}
                </span>
              </div>
            </div>
          </div>
        `;
      } else {
        slotInnerHTML = `
          <div class="slot-empty-prompt">
            ${
              state.selectedCastId
                ? "▸ ここをクリックして選択中の誘魅を配置 ◂"
                : "ここに誘魅を配置（ドラッグ＆ドロップ または クリック）"
            }
          </div>
        `;
      }

      let resolutionHTML = "";
      if (rState.result) {
        const res = rState.result;
        const passiveLine =
          res.passiveNotes && res.passiveNotes.length > 0
            ? `<div style="font-size:0.74rem; color:#f3e5ab;">★${escapeHtml(res.passiveNotes.join(" / "))}</div>`
            : "";
        resolutionHTML = `
          <div class="resolution-overlay">
            <div class="stamp-seal ${res.isSuccess ? "success" : "failure"}">
              ${
                res.isSuccess
                  ? `神楽成就<small>― 黄泉平坂より現世へ送り還した ―</small>`
                  : `鎮魂ならず<small>― ヨモツヘグイにより常世へ惹かれる ―</small>`
              }
            </div>
            <p class="resolution-flavor">${escapeHtml(res.flavor)}</p>
            ${passiveLine}
            <div class="resolution-delta">${formatDeltaText(res.deltaRep, res.deltaSpi)}</div>
          </div>
        `;
      }

      col.innerHTML = `
        <div class="room-watermark" aria-hidden="true">${escapeHtml(room.kanjiWatermark)}</div>

        <div class="room-header">
          <h3 class="room-name">${escapeHtml(room.name)}</h3>
          <div class="room-bonus-badge">
            ${roomBonusMeta.icon || ""}${roomBonusMeta.name}+${room.bonusValue}
            ${
              affinityCast
                ? `<span class="room-affinity-sub">（${escapeHtml(affinityCast.name)}:+2 / にゃる:+3）</span>`
                : ""
            }
          </div>
        </div>

        <!-- 来訪者（迷い込んだ客人）カード -->
        <article class="visitor-card">
          <div class="visitor-watermark" aria-hidden="true">${escapeHtml(visitor.kanjiWatermark)}</div>
          <div class="visitor-info">
            <div class="visitor-top-row">
              <h4 class="visitor-name">${escapeHtml(visitor.name)}</h4>
              <div class="visitor-req-group">
                ${reqBadgesHTML}
              </div>
            </div>
            <div class="visitor-stakes">
              <span class="stake-reward">現世還し：${rewardStr}</span>
              <span class="stake-penalty">常世堕ち：${penaltyStr}</span>
            </div>
          </div>
        </article>

        <!-- 誘魅配置枠 -->
        <div class="assignment-slot ${assignedCast ? "filled" : ""}" data-slot-room="${room.id}">
          ${slotInnerHTML}
        </div>

        ${resolutionHTML}
      `;

      col.addEventListener("dragover", (e) => {
        if (state.phase !== "assign") return;
        e.preventDefault();
        col.classList.add("drag-over");
      });

      col.addEventListener("dragleave", () => {
        col.classList.remove("drag-over");
      });

      col.addEventListener("drop", (e) => {
        if (state.phase !== "assign") return;
        e.preventDefault();
        col.classList.remove("drag-over");
        const droppedCastId = e.dataTransfer.getData("text/plain");
        if (droppedCastId) {
          assignCastToRoom(droppedCastId, room.id);
        }
      });

      col.addEventListener("click", (e) => {
        if (state.phase !== "assign") return;

        const unassignBtn = e.target.closest("[data-unassign-room]");
        if (unassignBtn) {
          e.stopPropagation();
          unassignRoom(room.id);
          return;
        }

        if (state.selectedCastId) {
          assignCastToRoom(state.selectedCastId, room.id);
        }
      });

      dom.roomsGrid.appendChild(col);
    });
  }

  /**
   * 下部の手札（山札からドローされた誘魅4名）を描画
   */
  function renderCastHand() {
    dom.castHand.innerHTML = "";

    const castToRoomName = {};
    DATA.rooms.forEach((room) => {
      const cId = state.roomState[room.id]?.assignedCastId;
      if (cId) {
        castToRoomName[cId] = room.name;
      }
    });

    const restingCasts = DATA.casts.filter((c) => (state.castCooldowns[c.id] || 0) > 0);
    const deckRemaining = Math.max(0, DATA.casts.length - state.handCastIds.length - restingCasts.length);
    if (dom.deckStatusBadge) {
      const restLabel =
        restingCasts.length > 0
          ? ` ／ 休息：${restingCasts.map((c) => c.name).join("・")}`
          : "";
      dom.deckStatusBadge.textContent = `控え：${deckRemaining}名${restLabel}`;
    }

    state.handCastIds.forEach((castId) => {
      const cast = DATA.casts.find((c) => c.id === castId);
      if (!cast) return;

      const assignedRoomName = castToRoomName[cast.id] || null;
      const isSelected = state.selectedCastId === cast.id;
      const deployCost = cast.deploySpiritCost || 0;
      const isCostLocked = !assignedRoomName && deployCost > 0 && state.spirit <= deployCost;
      const isDisabled = state.phase !== "assign" || isCostLocked;

      const card = document.createElement("article");
      card.className = "cast-card";
      if (cast.isSpecialSSR) card.classList.add("ssr-card");
      if (isSelected) card.classList.add("selected");
      if (assignedRoomName) card.classList.add("assigned-card");
      if (isCostLocked) card.classList.add("cost-locked-card");
      if (isDisabled) card.classList.add("disabled-card");

      card.draggable = !isDisabled;
      card.dataset.castId = cast.id;

      const safeImg = (cast.imagePath || "").trim();
      const portraitImgHTML = safeImg
        ? `<img src="${escapeHtml(safeImg)}" alt="${escapeHtml(cast.fullName)}" class="card-real-img" onload="this.parentElement.classList.add('has-loaded-img')" onerror="this.remove()">`
        : "";

      let ribbonHTML = "";
      if (assignedRoomName) {
        ribbonHTML = `<span class="cast-status-ribbon ribbon-assigned">${escapeHtml(assignedRoomName)}へ配置中</span>`;
      } else if (isCostLocked) {
        ribbonHTML = `<span class="cast-status-ribbon ribbon-cost-locked">雅不足（要${deployCost + 1}以上）</span>`;
      }

      const costPillHTML =
        deployCost > 0
          ? `<span class="ssr-cost-pill">配置：雅-${deployCost}</span>`
          : "";

      // 女将・常世（SSR）の場合は背景に八つ槌車の家紋透かしも添える
      const ssrKamonWatermarkHTML = cast.isSpecialSSR
        ? `<div class="ssr-kamon-bg" aria-hidden="true"><svg class="kamon-svg"><use href="#kamon-yatsuduchiguruma"></use></svg></div>`
        : "";

      const statKeys = ["talk", "dance", "party"];
      const statsHTML = statKeys
        .map((k) => {
          const meta = DATA.statsMeta[k];
          const val = cast.stats[k];
          const isSpec = val >= 3;
          return `
            <div class="cast-stat-pill ${isSpec ? "specialty" : ""}">
              <span class="stat-label">${meta.icon || ""}${meta.name}</span>
              <span class="stat-val">${val}</span>
            </div>
          `;
        })
        .join("");

      card.innerHTML = `
        <div class="cast-watermark" aria-hidden="true">${escapeHtml(cast.kanjiWatermark)}</div>
        ${ssrKamonWatermarkHTML}
        ${ribbonHTML}
        <div class="cast-portrait" style="background: radial-gradient(circle at 50% 45%, ${cast.accentColor}77, #0d0c12 85%)">
          ${portraitImgHTML}
          <span class="cast-portrait-kanji">${escapeHtml(cast.kanjiWatermark)}</span>
          <div class="cast-portrait-overlay">
            <span class="cast-role-tag">${escapeHtml(cast.title)}${costPillHTML}</span>
          </div>
        </div>
        <div class="cast-card-body">
          <div class="cast-header-row">
            <h4 class="cast-name">${escapeHtml(cast.name)}</h4>
            <div class="cast-stats-row">
              ${statsHTML}
            </div>
          </div>
          <div class="cast-trait-box">
            <span class="cast-trait-title">【${escapeHtml(cast.traitName)}】</span>
            <p class="cast-trait">${escapeHtml(cast.traitDesc)}</p>
          </div>
        </div>
      `;

      card.addEventListener("dragstart", (e) => {
        if (isDisabled) {
          e.preventDefault();
          return;
        }
        state.selectedCastId = cast.id;
        e.dataTransfer.setData("text/plain", cast.id);
        e.dataTransfer.effectAllowed = "move";
      });

      card.addEventListener("click", () => {
        if (state.phase !== "assign") return;
        if (isCostLocked) {
          addLog(
            `⚠️ 「${cast.fullName}」は配置時に『雅』を${deployCost}消費するため、現在の雅が1以下のときは配置できません。`,
            "log-fail"
          );
          return;
        }
        state.selectedCastId = state.selectedCastId === cast.id ? null : cast.id;
        renderAll();
      });

      dom.castHand.appendChild(card);
    });
  }

  function updateControlButtons() {
    const isAssign = state.phase === "assign";
    dom.btnClearAssign.disabled = !isAssign;
    dom.btnResolveNight.disabled = !isAssign;

    if (dom.btnBellRedraw) {
      const cost = DATA.config.bellSpiritCost || 1;
      const assignedCount = Object.values(state.roomState).filter((r) => r.assignedCastId).length;
      const hasUnplaced = state.handCastIds.length > assignedCount;
      const canUseBell = isAssign && !state.bellUsedThisNight && state.spirit > cost && hasUnplaced;

      dom.btnBellRedraw.disabled = !canUseBell;
      if (state.bellUsedThisNight) {
        dom.btnBellRedraw.textContent = "🔔 呼び鈴（使用済）";
      } else if (state.spirit <= cost) {
        dom.btnBellRedraw.textContent = `🔔 呼び鈴（雅不足）`;
      } else {
        dom.btnBellRedraw.textContent = `🔔 呼び鈴（雅-${cost}）`;
      }
    }

    if (state.selectedCastId) {
      const c = DATA.casts.find((item) => item.id === state.selectedCastId);
      dom.selectionHint.textContent = `【${c.fullName}】を選択中 ― 配置先のお座敷をクリック`;
    } else {
      dom.selectionHint.textContent =
        "誘魅をお座敷へドラッグ＆ドロップ、またはクリックで配置";
    }
  }

  /* ==========================================================================
     モーダル表示（夜明け・エンディング・ゲームオーバー）
     ========================================================================== */
  function showDawnModal() {
    state.phase = "modal";
    const nightLabel = NIGHT_LABELS[state.night - 1];
    const nextNightLabel = NIGHT_LABELS[state.night];

    dom.modalWatermark.textContent = "還";
    dom.modalSubtitle.textContent = "― 黄泉平坂より現世へ ―";
    dom.modalTitle.textContent = `${nightLabel} 明け`;

    const restingCasts = DATA.casts
      .filter((c) => (state.castCooldowns[c.id] || 0) > 0)
      .map((c) => c.fullName);

    const restNote =
      restingCasts.length > 0
        ? `<br><small style="color:#d4af37;">※${restingCasts.join("・")}は神楽の霊力を尽くしたため、次の一夜は休息として山札から外れます。</small>`
      : "";

    const difficultyNote =
      state.night === 2
        ? `<br><small style="color:#ff9e9e;">※第三夜以降は、深い未練や複合要求を抱えた迷い人が訪れやすくなります。</small>`
        : "";

    dom.modalBody.innerHTML = `
      神楽の調べに魂を鎮められた迷い人たちは、店外入口から竹林を割くように現世へ続く坂<strong>“黄泉平坂（よもつひらさか）”</strong>を登り、無事に現世へと還っていきました。<br>
      次の宵には、また新たな待機の誘魅巫女（いざなみのみこ）4名が帳場へ揃います。${restNote}${difficultyNote}
    `;

    dom.modalStatsSummary.innerHTML = `
      <span>🏮 現在の評判：<strong>${state.reputation}</strong></span>
      <span>🪭 現在の雅：<strong>${state.spirit}</strong></span>
    `;

    dom.btnModalNext.textContent = `${nextNightLabel}へ進む`;
    dom.btnModalNext.onclick = () => {
      dom.resultModal.classList.add("hidden");
      startNight(state.night + 1);
    };

    dom.resultModal.classList.remove("hidden");
  }

  /**
   * 今宵の殊勲（MVPキャスト）を選出する
   * 優先順位：1. おもてなし成功回数が多い ＞ 2. 配置回数が多い ＞ 3. DATA.casts定義順（すべて0回なら筆頭「女将・常世」）
   */
  function selectMvpCast() {
    let bestCast = DATA.casts[0];
    let bestSuccess = -1;
    let bestDeploy = -1;

    DATA.casts.forEach((cast) => {
      const st = state.castStats[cast.id] || { successCount: 0, deployCount: 0 };
      if (
        st.successCount > bestSuccess ||
        (st.successCount === bestSuccess && st.deployCount > bestDeploy)
      ) {
        bestCast = cast;
        bestSuccess = st.successCount;
        bestDeploy = st.deployCount;
      }
    });

    return {
      cast: bestCast,
      successCount: Math.max(0, bestSuccess),
      deployCount: Math.max(0, bestDeploy)
    };
  }

  /**
   * エンディング到達演出（金色の紙吹雪／静かな狐火／行灯消灯）を描画
   */
  function renderEndingEffects(endingType) {
    if (!dom.endingFxLayer) return;
    dom.endingFxLayer.innerHTML = "";

    if (endingType === "true") {
      const aura = document.createElement("div");
      aura.className = "fx-true-aura";
      dom.endingFxLayer.appendChild(aura);

      const confettiCount = 38;
      for (let i = 0; i < confettiCount; i++) {
        const piece = document.createElement("span");
        const isCrimson = i % 5 === 0;
        piece.className = `fx-gold-confetti ${isCrimson ? "crimson-leaf" : ""}`;
        piece.style.left = `${(i / confettiCount) * 100 + (Math.random() * 4 - 2)}%`;
        piece.style.animationDuration = `${3.8 + Math.random() * 3.4}s`;
        piece.style.animationDelay = `${Math.random() * 3.2}s`;
        piece.style.setProperty("--drift-x", `${(Math.random() - 0.5) * 160}px`);
        dom.endingFxLayer.appendChild(piece);
      }
    } else if (endingType === "normal") {
      const aura = document.createElement("div");
      aura.className = "fx-normal-aura";
      dom.endingFxLayer.appendChild(aura);

      const flameCount = 18;
      for (let i = 0; i < flameCount; i++) {
        const orb = document.createElement("span");
        const isAmber = i % 3 === 0;
        orb.className = `fx-kitsunebi ${isAmber ? "amber-flame" : ""}`;
        const size = 14 + Math.random() * 20;
        orb.style.width = `${size}px`;
        orb.style.height = `${size}px`;
        orb.style.left = `${6 + Math.random() * 88}%`;
        orb.style.animationDuration = `${5.5 + Math.random() * 4.5}s`;
        orb.style.animationDelay = `${Math.random() * 4}s`;
        orb.style.setProperty("--sway-x", `${(Math.random() - 0.5) * 90}px`);
        dom.endingFxLayer.appendChild(orb);
      }
    } else {
      const dark = document.createElement("div");
      dark.className = "fx-bad-darkness";
      dom.endingFxLayer.appendChild(dark);

      const lantern = document.createElement("div");
      lantern.className = "fx-andon-lantern";
      lantern.innerHTML = `
        <div class="fx-andon-smoke"></div>
        <div class="fx-andon-flame"></div>
      `;
      dom.endingFxLayer.appendChild(lantern);
    }
  }

  /**
   * 豪華リザルト画面（帳場日報：エンディング3分岐）を表示
   * @param {"true" | "normal" | "bad"} endingType
   * @param {{ isDebug?: boolean }} options
   */
  function showEndingScreen(endingType, options = {}) {
    state.phase = "modal";

    // 他のオーバーレイが開いていれば閉じる
    dom.cutinOverlay?.classList.add("hidden");
    dom.resultModal?.classList.add("hidden");
    dom.helpModal?.classList.add("hidden");
    dom.titleScreen?.classList.add("hidden");
    dom.introScreen?.classList.add("hidden");

    const endingMeta = DATA.endings?.[endingType] || DATA.endings.normal;
    const maxRooms = (DATA.config.maxNights || 5) * (DATA.rooms.length || 3);

    // 表示用スコア（デバッグボタンから即座に開いた場合、分岐条件に合う見栄えの良い値を補完）
    let displayRep = state.reputation;
    let displaySpi = state.spirit;
    let displayRooms = state.totalSuccessCount;

    if (options.isDebug) {
      if (endingType === "true") {
        if (displayRep + displaySpi < 8) {
          displayRep = 5;
          displaySpi = 4;
        }
        if (displayRooms === 0) displayRooms = 14;
      } else if (endingType === "normal") {
        if (displayRep + displaySpi > 7 || displayRep <= 0 || displaySpi <= 0) {
          displayRep = 3;
          displaySpi = 3;
        }
        if (displayRooms === 0) displayRooms = 10;
      } else if (endingType === "bad") {
        if (displayRep > 0 && displaySpi > 0) {
          displayRep = 0;
          displaySpi = 2;
        }
      }
    }

    const mvpInfo = selectMvpCast();
    const mvpCast = mvpInfo.cast;
    const mvpSuccessCount =
      options.isDebug && mvpInfo.successCount === 0 && endingType !== "bad"
        ? endingType === "true"
          ? 5
          : 3
        : mvpInfo.successCount;

    // 巻物カードのランククラス切替
    if (dom.endingScrollCard) {
      dom.endingScrollCard.classList.remove("ending-rank-true", "ending-rank-normal", "ending-rank-bad");
      dom.endingScrollCard.classList.add(`ending-rank-${endingType}`);
    }

    // 1. 到達演出エフェクト
    renderEndingEffects(endingType);

    // 2. 結果サマリー（帳場総括）
    if (dom.endingWatermark) dom.endingWatermark.textContent = endingMeta.watermark || "帳";
    if (dom.endingRankBadge) dom.endingRankBadge.textContent = endingMeta.rankLabel;
    if (dom.endingSealStamp) dom.endingSealStamp.textContent = endingMeta.sealText;
    if (dom.endingTitle) dom.endingTitle.textContent = endingMeta.title;
    if (dom.endingDescription) dom.endingDescription.textContent = endingMeta.description;

    // 最終スコア表示：「最終評判：★×○」「最終雅：◆×○」「おもてなし成功数：○ / 15室」
    if (dom.endingScoreRep) {
      dom.endingScoreRep.textContent = `★×${displayRep}`;
    }
    if (dom.endingScoreRepStars) {
      const maxRep = DATA.config.maxReputation || 5;
      dom.endingScoreRepStars.textContent =
        "★".repeat(Math.max(0, displayRep)) + "☆".repeat(Math.max(0, maxRep - displayRep));
    }

    if (dom.endingScoreSpirit) {
      dom.endingScoreSpirit.textContent = `◆×${displaySpi}`;
    }
    if (dom.endingScoreSpiritGems) {
      const maxSpi = DATA.config.maxSpirit || 5;
      dom.endingScoreSpiritGems.textContent =
        "◆".repeat(Math.max(0, displaySpi)) + "◇".repeat(Math.max(0, maxSpi - displaySpi));
    }

    if (dom.endingScoreRooms) {
      dom.endingScoreRooms.textContent = `${displayRooms} / ${maxRooms}室`;
    }
    if (dom.endingScoreRoomsSub) {
      dom.endingScoreRoomsSub.textContent =
        endingType === "bad"
          ? `${NIGHT_LABELS[state.night - 1] || `第${state.night}夜`}にて営業終了`
          : `全五夜 完遂（合計値：${displayRep + displaySpi} / 10）`;
    }

    // 3. 今宵の殊勲（MVPキャスト表示枠＆一言ネギライ台詞）
    if (dom.endingMvpCard) {
      dom.endingMvpCard.classList.remove("has-loaded-img");
      dom.endingMvpCard.style.background = `radial-gradient(circle at 50% 42%, ${mvpCast.accentColor}77, #0d0c12 88%)`;
      const safeImg = (mvpCast.imagePath || "").trim();
      const imgHTML = safeImg
        ? `<img src="${escapeHtml(safeImg)}" alt="${escapeHtml(mvpCast.fullName)}" class="card-real-img" onload="this.parentElement.classList.add('has-loaded-img')" onerror="this.remove()">`
        : "";
      dom.endingMvpCard.innerHTML = `
        <span class="ending-mvp-card-tag">今宵の殊勲</span>
        ${imgHTML}
        <span class="ending-mvp-kanji">${escapeHtml(mvpCast.kanjiWatermark)}</span>
        <span class="ending-mvp-card-caption">${escapeHtml(mvpCast.fullName)}</span>
      `;
    }

    if (dom.endingMvpTitle) {
      dom.endingMvpTitle.textContent = `今宵の殊勲：${mvpCast.fullName}（おもてなし成功 ${mvpSuccessCount}回）`;
    }
    if (dom.endingMvpSpeaker) {
      dom.endingMvpSpeaker.textContent = `【${mvpCast.fullName}からの労い】`;
    }
    if (dom.endingMvpQuote) {
      const quoteText =
        mvpCast.endingQuotes?.[endingType] ||
        mvpCast.quote ||
        "「今宵の帳場もお疲れ様。また次の夜もよろしく頼んだよ。」";
      dom.endingMvpQuote.textContent = quoteText;
    }

    // 4. アクションボタン（リトライ ＆ Xで呟く）
    if (dom.btnEndingRetry) {
      dom.btnEndingRetry.onclick = () => {
        dom.endingModal.classList.add("hidden");
        initGame();
      };
    }

    if (dom.btnEndingShare) {
      dom.btnEndingShare.onclick = () => {
        const shareLines = [
          `【逢曲時 帳場録 ― 帳場日報 ―】`,
          `到達結末：${endingMeta.title}（${endingMeta.rankLabel}）`,
          `最終評判：★×${displayRep} ／ 最終雅：◆×${displaySpi}`,
          `おもてなし成功数：${displayRooms} / ${maxRooms}室`,
          `👑今宵の殊勲：${mvpCast.fullName}（おもてなし成功 ${mvpSuccessCount}回）`,
          `${mvpCast.endingQuotes?.[endingType] || ""}`,
          `#逢曲時 #逢曲時帳場録`
        ];
        const shareUrl = "https://oumagatoki.pages.dev/";
        const tweetIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareLines.join("\n")
        )}&url=${encodeURIComponent(shareUrl)}`;
        window.open(tweetIntent, "_blank", "noopener,noreferrer");
      };
    }

    dom.endingModal?.classList.remove("hidden");
  }

  /* ==========================================================================
     ユーティリティ＆ログ出力
     ========================================================================== */
  function addLog(message, className = "") {
    const div = document.createElement("div");
    div.className = `log-entry ${className}`;
    div.textContent = message;
    dom.gameLog.prepend(div);
  }

  function formatStake(stakeObj, isReward) {
    const parts = [];
    if (stakeObj.reputation) {
      const sign = stakeObj.reputation > 0 ? "+" : "";
      parts.push(`評判${sign}${stakeObj.reputation}`);
    }
    if (stakeObj.spirit) {
      const sign = stakeObj.spirit > 0 ? "+" : "";
      parts.push(`雅${sign}${stakeObj.spirit}`);
    }
    return parts.length > 0 ? parts.join(" / ") : isReward ? "変動なし" : "ペナルティなし";
  }

  function formatDeltaText(deltaRep, deltaSpi) {
    const items = [];
    if (deltaRep !== 0) {
      items.push(`評判${deltaRep > 0 ? "+" : ""}${deltaRep}`);
    }
    if (deltaSpi !== 0) {
      items.push(`雅${deltaSpi > 0 ? "+" : ""}${deltaSpi}`);
    }
    return items.length > 0 ? `（${items.join("、")}）` : "（変動なし）";
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function triggerAnimClass(element, className) {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ==========================================================================
     背景Canvas演出（彼岸花の花弁・八つ槌車の金灯・迷い人の蒼き魂火）
     ========================================================================== */
  function initBackgroundParticles() {
    const canvas = dom.bgCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 38;

    for (let i = 0; i < count; i++) {
      const mod = i % 3;
      const type = mod === 0 ? "petal" : mod === 1 ? "goldfire" : "soulfire";
      particles.push({
        type,
        x: Math.random() * width,
        y: Math.random() * height,
        r: type === "petal" ? 3 + Math.random() * 3.5 : 2 + Math.random() * 4,
        vx: (Math.random() - 0.5) * 0.38,
        vy: type === "petal" ? 0.32 + Math.random() * 0.5 : -(0.18 + Math.random() * 0.42),
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.02,
        alpha: 0.25 + Math.random() * 0.48
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.angle += p.spin;
        p.x += p.vx + Math.sin(p.angle) * 0.24;
        p.y += p.vy;

        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.save();
        if (p.type === "goldfire") {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4.2);
          glow.addColorStop(0, `rgba(212, 175, 55, ${p.alpha})`);
          glow.addColorStop(0.5, `rgba(201, 42, 42, ${p.alpha * 0.35})`);
          glow.addColorStop(1, "rgba(10, 10, 10, 0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 4.2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "soulfire") {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
          glow.addColorStop(0, `rgba(140, 210, 255, ${p.alpha * 0.85})`);
          glow.addColorStop(0.5, `rgba(80, 130, 210, ${p.alpha * 0.3})`);
          glow.addColorStop(1, "rgba(10, 10, 10, 0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillStyle = `rgba(201, 24, 42, ${p.alpha * 0.9})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r * 1.45, p.r * 0.52, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  /* ==========================================================================
     イベントリスナー登録＆起動
     ========================================================================== */
  if (dom.btnBellRedraw) {
    dom.btnBellRedraw.addEventListener("click", useBellRedraw);
  }
  dom.btnClearAssign.addEventListener("click", clearAllAssignments);
  dom.btnResolveNight.addEventListener("click", resolveNight);

  dom.btnHelp.addEventListener("click", () => {
    dom.helpModal.classList.remove("hidden");
  });

  dom.btnCloseHelp.addEventListener("click", () => {
    dom.helpModal.classList.add("hidden");
  });

  dom.helpModal.addEventListener("click", (e) => {
    if (e.target === dom.helpModal) {
      dom.helpModal.classList.add("hidden");
    }
  });

  // タイトル画面 → 遊び方説明画面 → ゲーム本編開始の画面遷移
  if (dom.btnTitleStart) {
    dom.btnTitleStart.addEventListener("click", () => {
      dom.titleScreen.classList.add("hidden");
      dom.introScreen.classList.remove("hidden");
    });
  }

  if (dom.btnIntroBack) {
    dom.btnIntroBack.addEventListener("click", () => {
      dom.introScreen.classList.add("hidden");
      dom.titleScreen.classList.remove("hidden");
    });
  }

  if (dom.btnIntroPlay) {
    dom.btnIntroPlay.addEventListener("click", () => {
      dom.introScreen.classList.add("hidden");
      initGame();
    });
  }

  // デバッグ確認用ショートカット（[Debug: True] / [Debug: Normal] / [Debug: Bad]）
  if (dom.debugEndingBar) {
    dom.debugEndingBar.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-debug-ending]");
      if (!btn) return;
      const endingType = btn.dataset.debugEnding;
      if (endingType === "true" || endingType === "normal" || endingType === "bad") {
        showEndingScreen(endingType, { isDebug: true });
      }
    });
  }

  initBackgroundParticles();
  initGame();
})();
