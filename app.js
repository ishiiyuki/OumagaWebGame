/**
 * 『逢曲時 帳場録（おうまがどき ちょうばろく）』メインゲームロジック
 * ― 彼岸旅館「逢曲時」お座敷遊び・歓談・舞踊のおもてなし版 ―
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
    selectedCastId: null,     // クリック選択中のキャストID
    handCastIds: [],          // 今夜の手札として配られた4名のキャストID配列
    bellUsedThisNight: false, // 今夜「帳場の呼び鈴（手札入替）」を使用したか
    roomState: {},            // { [roomId]: { visitor, assignedCastId, result } }
    castCooldowns: {}         // { [castId]: remainingTurns }（1ターン休み管理）
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
    btnHelp: document.getElementById("btn-help"),
    helpModal: document.getElementById("help-modal"),
    btnCloseHelp: document.getElementById("btn-close-help"),
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

    DATA.casts.forEach((c) => {
      state.castCooldowns[c.id] = 0;
    });

    if (dom.nightTotal) {
      dom.nightTotal.textContent = `/ 全${NIGHT_LABELS[DATA.config.maxNights - 1]?.replace("第", "") || "五夜"}`;
    }

    dom.gameLog.innerHTML = "";
    addLog("帳場を開きました。全五夜のあいだ、お座敷の『評判』と『雅（みやび）』を守り抜きましょう。");

    startNight(1);
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
   * 夜の進行度に応じた重み付けで来訪者（客人）を3部屋分抽選する
   * - 1〜2夜目：高難度（要求5や複合要求）を出にくくし、標準・ラッキー枠を中心に出現
   * - 3夜目以降：高難度や複合要求が出やすくなる
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
   * 山札（全8名）から「1ターン休み」のキャストを除外し、ランダムで手札（4名）をドローする
   */
  function drawInitialHand() {
    const availablePool = DATA.casts.filter((c) => (state.castCooldowns[c.id] || 0) <= 0);
    shuffleArray(availablePool);
    const count = Math.min(DATA.config.handSize || 4, availablePool.length);
    state.handCastIds = availablePool.slice(0, count).map((c) => c.id);
  }

  /**
   * 手札事故防止システム「帳場の呼び鈴（手札入替）」
   * 配置フェーズ中、1ターンに1回だけ「雅」を1消費して、未配置の手札をすべて山札に戻し新しく引き直す
   */
  function useBellRedraw() {
    if (state.phase !== "assign") return;
    if (state.bellUsedThisNight) {
      addLog("「帳場の呼び鈴」は一夜につき一度しか鳴らせません。");
      return;
    }

    const cost = DATA.config.bellSpiritCost || 1;
    // 雅を消費して0になるとゲームオーバーになるため、雅がコスト以下の場合は使用不可にして安全確保
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

    // 休み中でなく、かつ現在配置されていないキャスト候補
    const allEligibleIds = DATA.casts
      .filter((c) => (state.castCooldowns[c.id] || 0) <= 0 && !assignedIds.has(c.id))
      .map((c) => c.id);

    // 現在の未配置手札とは別の山札控えキャストを優先して引く
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

    addLog(`🔔 帳場の呼び鈴を鳴らし（雅-${cost}）、待機中の手札を入れ替えました！（新着：${drawnNames}）`);
    renderAll();
  }

  /**
   * 夕暮れ〜逢魔が時フェーズ開始
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

    addLog(`―― 【${nightLabel}・夕暮れ】三つのお座敷に客人が見えられ、待機の誘魅（いざなみ）4名が帳場へ揃いました。${restText}`);

    updateStatusUI();
    renderAll();

    // 少し間を置いて「逢魔が時（配置フェーズ）」へハイライト移動
    setTimeout(() => {
      if (state.phase === "assign") {
        setPhaseIndicator("oumaga");
      }
    }, 450);
  }

  /* ==========================================================================
     計算・判定ロジック（複合要求＆固有パッシブ効果対応）
     ========================================================================== */

  /**
   * 特定の部屋に特定のキャストを配置した際の能力値・ボーナス内訳を全要求属性について計算する
   */
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

      // 部屋のボーナス属性と要求属性が一致する場合
      if (room.bonusStat === statKey) {
        if (cast.passiveType === "room_bonus_override") {
          // 帳場頭・にゃる：配置した客室のボーナス効果を「+1」ではなく「+3」として計算
          roomBonus = cast.passiveValue || 3;
        } else {
          roomBonus = room.bonusValue || 1;
          // 特定キャスト（常世・ハルカ・ならく）の部屋相性ボーナス
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

    // すべての要求属性を同時に満たしている場合のみ成功
    const isSuccess = Boolean(cast) && checks.every((c) => c.passed);

    // 報酬・ペナルティとキャスト固有パッシブ効果の計算
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
        // 失敗時：姉御肌・たまも「場を取り繕いペナルティ（評判・雅の減少）を1軽減」
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

  /**
   * キャストが現在いずれかのお座敷に配置されているか判定する
   */
  function isCastCurrentlyAssigned(castId) {
    return Object.values(state.roomState).some((r) => r.assignedCastId === castId);
  }

  /**
   * キャストを客室へ配置する（「筆頭・常世」など配置コスト持ちの雅消費・返却に対応）
   */
  function assignCastToRoom(castId, roomId) {
    if (state.phase !== "assign") return;
    if (!state.handCastIds.includes(castId)) return;

    const cast = DATA.casts.find((c) => c.id === castId);
    if (!cast) return;

    const targetRoomState = state.roomState[roomId];
    if (!targetRoomState) return;

    // すでに同じ部屋に配置されている場合は何もしない
    if (targetRoomState.assignedCastId === castId) {
      state.selectedCastId = null;
      renderAll();
      return;
    }

    const wasAlreadyAssignedElsewhere = isCastCurrentlyAssigned(castId);
    const prevCastInTargetRoom = targetRoomState.assignedCastId
      ? DATA.casts.find((c) => c.id === targetRoomState.assignedCastId)
      : null;

    // 新規に手札から配置される場合の追加コストと、ターゲット部屋の先住キャストが外れることによる返却分を計算
    const costToPay = !wasAlreadyAssignedElsewhere ? (cast.deploySpiritCost || 0) : 0;
    const refundFromPrev = prevCastInTargetRoom ? (prevCastInTargetRoom.deploySpiritCost || 0) : 0;
    const netSpiritChange = refundFromPrev - costToPay;

    // 雅が1以下（消費後に0以下になる）の場合は配置不可ロック
    if (state.spirit + netSpiritChange <= 0) {
      addLog(
        `⚠️ 「${cast.fullName}」は格式が高いため、配置に『雅』を${costToPay}消費します（現在の雅が1以下のため配置できません）。`,
        "log-fail"
      );
      state.selectedCastId = null;
      renderAll();
      return;
    }

    // 1. もしターゲットの部屋に別のキャストが配置されていたら外し、コスト持ちなら返却ログを出す
    if (prevCastInTargetRoom) {
      targetRoomState.assignedCastId = null;
      if (refundFromPrev > 0) {
        applyStatusDelta(0, refundFromPrev);
        addLog(`「${prevCastInTargetRoom.fullName}」の配置を解き、『雅』が +${refundFromPrev} 返却されました。`);
      }
    }

    // 2. 既に他の部屋にこのキャストが配置されていた場合はそこから移動（コスト消費は発生しない）
    Object.keys(state.roomState).forEach((rId) => {
      if (state.roomState[rId].assignedCastId === castId) {
        state.roomState[rId].assignedCastId = null;
      }
    });

    // 3. 新たに配置してコストを消費
    targetRoomState.assignedCastId = castId;
    if (costToPay > 0) {
      applyStatusDelta(0, -costToPay);
      const roomObj = DATA.rooms.find((r) => r.id === roomId);
      addLog(`✨ 【女将の威光】「${cast.fullName}」を${roomObj ? roomObj.name : "お座敷"}へ配置しました（雅-${costToPay}）。`);
    }

    state.selectedCastId = null;
    renderAll();
  }

  /**
   * 客室のキャスト配置を解除する（配置コスト持ちの場合は「雅」を返却）
   */
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

  /**
   * 全客室の配置をクリア（配置コスト持ちがいれば「雅」を返却）
   */
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
     夜更け（解決フェーズ）アニメーション進行
     ========================================================================== */
  async function resolveNight() {
    if (state.phase !== "assign") return;
    state.phase = "resolving";
    state.selectedCastId = null;
    setPhaseIndicator("midnight");
    renderAll();

    const nightLabel = NIGHT_LABELS[state.night - 1] || `第${state.night}夜`;
    addLog(`―― 【${nightLabel}・夜更け】お座敷のおもてなし判定を開始します。`);

    const usedCastIdsThisNight = new Set();

    // 3部屋を順番に判定
    for (let i = 0; i < DATA.rooms.length; i++) {
      const room = DATA.rooms[i];
      const rState = state.roomState[room.id];
      const visitor = rState.visitor;
      const cast = DATA.casts.find((c) => c.id === rState.assignedCastId) || null;

      if (cast) {
        usedCastIdsThisNight.add(cast.id);
      }

      await sleep(420);

      const evalResult = evaluateAssignment(room, visitor, cast);
      const { isSuccess, deltaRep, deltaSpi, passiveNotes, checks } = evalResult;

      rState.result = {
        isSuccess,
        evalResult,
        deltaRep,
        deltaSpi,
        passiveNotes,
        flavor: isSuccess ? visitor.successFlavor : visitor.failFlavor
      };

      // おもてなし成功時は画面中央にカットイン会話ウィンドウを表示し、プレイヤーが確認してから次へ進む
      if (isSuccess && cast) {
        await showHospitalityCutin(room, visitor, cast, deltaRep, deltaSpi, passiveNotes);
      }

      // ステータス反映（0〜最大値にクランプ）
      applyStatusDelta(deltaRep, deltaSpi);

      // 判定内訳テキスト作成
      const checkSummary = checks
        .map((c) => `${c.statName}${c.totalVal}/${c.reqVal}`)
        .join("・");
      const passiveSuffix = passiveNotes.length > 0 ? ` ［${passiveNotes.join(" / ")}］` : "";

      if (isSuccess) {
        addLog(
          `【${room.name}】${cast.fullName}のおもてなし成功（お座敷が華やいだ）！ 客人「${visitor.name}」（${checkSummary}） ${formatDeltaText(deltaRep, deltaSpi)}${passiveSuffix}`,
          "log-success"
        );
      } else {
        const castLabel = cast ? cast.fullName : "未配置";
        addLog(
          `【${room.name}】「${visitor.name}」の不興を買ってしまった（座が白けてしまった）…（${castLabel}: ${checkSummary}） ${formatDeltaText(deltaRep, deltaSpi)}${passiveSuffix}`,
          "log-fail"
        );
      }

      renderRooms();

      await sleep(750);

      // 途中で評判または雅が0になったら即座にゲームオーバー判定へ
      if (state.reputation <= 0 || state.spirit <= 0) {
        break;
      }
    }

    await sleep(600);

    // 1. ゲームオーバーチェック
    if (state.reputation <= 0 || state.spirit <= 0) {
      showGameOverModal();
      return;
    }

    // 2. 全5夜クリアチェック
    if (state.night >= DATA.config.maxNights) {
      showEndingModal();
      return;
    }

    // 3. クールダウン更新（前夜休みだったキャストは復帰し、今夜配置されたまりん等が次夜休みになる）
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
   * おもてなし成功時の画面中央カットイン会話ウィンドウを表示し、
   * クリック（または「次へ」ボタン）で閉じるまで待機するPromiseを返す
   */
  function showHospitalityCutin(room, visitor, cast, deltaRep, deltaSpi, passiveNotes = []) {
    return new Promise((resolve) => {
      const castDialogues = DATA.hospitalityDialogues?.[cast.id];
      const scene = castDialogues?.byVisitor?.[visitor.id] || {
        castLine: castDialogues?.defaultCastLine || cast.quote || "「心を込めておもてなしいたします」",
        visitorLine: "「いやあ、見事なお座敷であった！ 今宵は実に良い酒と芸を楽しませてもらったぞ」",
        narration: visitor.successFlavor
      };

      const reqs = getVisitorRequirements(visitor);
      const primaryMeta = DATA.statsMeta[reqs[0].stat];

      // ヘッダー情報
      dom.cutinBgKanji.textContent = cast.kanjiWatermark || "饗";
      dom.cutinRoomTag.textContent = `${room.name}（${room.reading}）`;

      const rewardText = formatStake({ reputation: deltaRep, spirit: deltaSpi }, true);
      const passiveBadge = passiveNotes.length > 0 ? `（${passiveNotes.join("・")}）` : "";
      dom.cutinRewardBadge.textContent = `獲得：${rewardText}${passiveBadge}`;

      // 左側：キャストポートレート
      const safeCastImg = (cast.imagePath || "").trim();
      const castImgTag = safeCastImg
        ? `<img src="${escapeHtml(safeCastImg)}" alt="${escapeHtml(cast.fullName)}" class="card-real-img" onerror="this.remove()">`
        : "";
      dom.cutinCastBox.innerHTML = `
        <div class="cutin-portrait-frame" style="background: radial-gradient(circle at 50% 30%, ${cast.accentColor}66, #14151f)">
          ${castImgTag}
          <span class="cutin-portrait-kanji">${escapeHtml(cast.kanjiWatermark)}</span>
          <span class="cutin-portrait-caption">${escapeHtml(cast.title)}</span>
        </div>
      `;

      // 右側：宿泊客ポートレート
      const safeVisImg = (visitor.imagePath || "").trim();
      const visImgTag = safeVisImg
        ? `<img src="${escapeHtml(safeVisImg)}" alt="${escapeHtml(visitor.name)}" class="card-real-img" onerror="this.remove()">`
        : "";
      dom.cutinVisitorBox.innerHTML = `
        <div class="cutin-portrait-frame" style="background: radial-gradient(circle at 50% 30%, ${primaryMeta.color}66, #14151f)">
          ${visImgTag}
          <span class="cutin-portrait-kanji">${escapeHtml(visitor.kanjiWatermark)}</span>
          <span class="cutin-portrait-caption">${escapeHtml(visitor.category)}</span>
        </div>
      `;

      // 中央：2〜3行のミニ会話
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

  function createVisualBoxHTML(imagePath, kanjiWatermark, subText, accentColor) {
    const safeImgPath = (imagePath || "").trim();
    const imgTag = safeImgPath
      ? `<img src="${escapeHtml(safeImgPath)}" alt="" class="card-real-img" onerror="this.remove()">`
      : "";

    const styleAttr = accentColor
      ? `style="background: radial-gradient(circle at 50% 30%, ${accentColor}44, #14151f 90%);"`
      : "";

    return `
      <div class="card-visual-box" ${styleAttr}>
        ${imgTag}
        <div class="placeholder-art">
          <span class="placeholder-kanji">${escapeHtml(kanjiWatermark || "客")}</span>
          <span class="placeholder-sub">${escapeHtml(subText || "")}</span>
        </div>
      </div>
    `;
  }

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

    // トークン描画
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
    dom.phaseDusk.classList.toggle("active", phaseKey === "dusk");
    dom.phaseOumaga.classList.toggle("active", phaseKey === "oumaga");
    dom.phaseMidnight.classList.toggle("active", phaseKey === "midnight");
  }

  /**
   * 3つのお座敷エリアを描画（単一要求・複合要求バッジに完全対応）
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
      const primaryMeta = DATA.statsMeta[reqs[0].stat];

      const col = document.createElement("section");
      col.className = "room-column";
      if (state.phase === "assign" && state.selectedCastId) {
        col.classList.add("selectable-target");
      }
      col.dataset.roomId = room.id;

      // 来訪者の要求バッジ（アイコン付き・複数要求の場合は2つ並べて表示）
      const reqBadgesHTML = reqs
        .map((r) => {
          const m = DATA.statsMeta[r.stat];
          return `<span class="visitor-req-badge stat-bg-${r.stat}">${m.icon || ""}【${m.name}】${r.value}</span>`;
        })
        .join("");

      // 報酬・ペナルティ文字列
      const rewardStr = formatStake(visitor.reward, true);
      const penaltyStr = formatStake(visitor.penalty, false);

      // 配置スロットの中身
      let slotInnerHTML = "";
      if (assignedCast) {
        const evalPreview = evaluateAssignment(room, visitor, assignedCast);

        // 各要求に対する基礎値＋部屋ボーナス内訳を作成
        const breakdownItemsHTML = evalPreview.checks
          .map((chk) => {
            const bonusSum = chk.roomBonus + chk.affinityBonus;
            const bonusTag =
              bonusSum > 0
                ? `<span class="calc-bonus-highlight">+${bonusSum}</span>`
                : "";
            const mark = chk.passed ? "○" : "×";
            return `<span>${chk.statIcon}【${chk.statName}】<strong>${chk.baseVal}</strong>${bonusTag}＝<strong>${chk.totalVal}</strong>/${chk.reqVal}(${mark})</span>`;
          })
          .join(" ／ ");

        const passiveHint =
          evalPreview.passiveNotes.length > 0
            ? `<div style="font-size:0.68rem; color:#e6a15c; margin-top:2px;">★${escapeHtml(evalPreview.passiveNotes.join("・"))}</div>`
            : "";

        const unassignLabel =
          (assignedCast.deploySpiritCost || 0) > 0
            ? `外す（雅+${assignedCast.deploySpiritCost}返却）`
            : "外す";

        const safeAssignedImg = (assignedCast.imagePath || "").trim();
        const miniSealImgHTML = safeAssignedImg
          ? `<img src="${escapeHtml(safeAssignedImg)}" alt="" class="card-real-img" onerror="this.remove()">`
          : "";

        slotInnerHTML = `
          <div class="assigned-cast-view">
            <div class="assigned-cast-top">
              <div class="assigned-cast-identity">
                <div class="mini-seal" style="background:${assignedCast.accentColor}">
                  ${miniSealImgHTML}
                  <span>${escapeHtml(assignedCast.kanjiWatermark)}</span>
                </div>
                <div>
                  <div class="assigned-cast-name">${escapeHtml(assignedCast.fullName)}</div>
                </div>
              </div>
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
                ${evalPreview.isSuccess ? "成功見込" : "能力不足"}
              </span>
            </div>
          </div>
        `;
      } else {
        slotInnerHTML = `
          <div class="slot-empty-prompt">
            ${
              state.selectedCastId
                ? "▸ ここをクリックして選択中の誘魅（いざなみ）を配置 ◂"
                : "ここにお座敷担当の誘魅（いざなみ）を配置（ドラッグ＆ドロップ または クリック）"
            }
            <span>※未配置のまま夜を進めると【不興（座が白ける）】となります</span>
          </div>
        `;
      }

      // 解決フェーズの結果オーバーレイ
      let resolutionHTML = "";
      if (rState.result) {
        const res = rState.result;
        const passiveLine =
          res.passiveNotes && res.passiveNotes.length > 0
            ? `<div style="font-size:0.74rem; color:#ffd57e;">★${escapeHtml(res.passiveNotes.join(" / "))}</div>`
            : "";
        resolutionHTML = `
          <div class="resolution-overlay">
            <div class="stamp-seal ${res.isSuccess ? "success" : "failure"}">
              ${
                res.isSuccess
                  ? `おもてなし成功<small>― お座敷が華やいだ ―</small>`
                  : `不興を買ってしまった<small>― 座が白けてしまった ―</small>`
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
          <div class="room-title-wrap">
            <span class="room-wooden-tag">座敷</span>
            <div>
              <h3 class="room-name">${escapeHtml(room.name)}</h3>
              <span class="room-reading">${escapeHtml(room.reading)}</span>
            </div>
          </div>
          <div class="room-bonus-badge">
            ${roomBonusMeta.icon || ""}【${roomBonusMeta.name}】+${room.bonusValue}
            ${
              affinityCast
                ? `<span class="room-affinity-sub">（${escapeHtml(affinityCast.name)}:+2 / にゃる:+3）</span>`
                : ""
            }
          </div>
        </div>

        <!-- 来訪者（お座敷の客人）カード -->
        <article class="visitor-card">
          <div class="visitor-watermark" aria-hidden="true">${escapeHtml(visitor.kanjiWatermark)}</div>
          ${createVisualBoxHTML(visitor.imagePath, visitor.kanjiWatermark, visitor.category, primaryMeta.color)}
          <div class="visitor-info">
            <div class="visitor-top-row">
              <span class="visitor-category">${escapeHtml(visitor.category)}</span>
              <div class="visitor-req-group">
                ${reqBadgesHTML}
              </div>
            </div>
            <h4 class="visitor-name">${escapeHtml(visitor.name)}</h4>
            <p class="visitor-desc">${escapeHtml(visitor.desc)}</p>
            <div class="visitor-stakes">
              <span class="stake-reward">成功：${rewardStr}</span>
              <span class="stake-penalty">失敗：${penaltyStr}</span>
            </div>
          </div>
        </article>

        <!-- キャスト配置枠 -->
        <div class="assignment-slot ${assignedCast ? "filled" : ""}" data-slot-room="${room.id}">
          ${slotInnerHTML}
        </div>

        ${resolutionHTML}
      `;

      // イベント設定：ドラッグ＆ドロップ受け入れ
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

      // イベント設定：クリックによるキャスト配置／解除
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
   * 下部の手札（山札からドローされた4名）を描画
   */
  function renderCastHand() {
    dom.castHand.innerHTML = "";

    // 現在どの部屋に誰が配置されているか逆引き
    const castToRoomName = {};
    DATA.rooms.forEach((room) => {
      const cId = state.roomState[room.id]?.assignedCastId;
      if (cId) {
        castToRoomName[cId] = room.name;
      }
    });

    // 山札状況バッジの更新
    const restingCasts = DATA.casts.filter((c) => (state.castCooldowns[c.id] || 0) > 0);
    const deckRemaining = Math.max(0, DATA.casts.length - state.handCastIds.length - restingCasts.length);
    if (dom.deckStatusBadge) {
      const restLabel =
        restingCasts.length > 0
          ? ` ／ 休息中：${restingCasts.map((c) => c.name).join("・")}`
          : "";
      dom.deckStatusBadge.textContent = `山札控え：${deckRemaining}名${restLabel}`;
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

      // ポートレート画像または漢字プレースホルダー
      const safeImg = (cast.imagePath || "").trim();
      const portraitImgHTML = safeImg
        ? `<img src="${escapeHtml(safeImg)}" alt="${escapeHtml(cast.fullName)}" class="card-real-img" onerror="this.remove()">`
        : "";

      // 状態リボン
      let ribbonHTML = "";
      if (assignedRoomName) {
        ribbonHTML = `<span class="cast-status-ribbon ribbon-assigned">${escapeHtml(assignedRoomName)}へ配置中</span>`;
      } else if (isCostLocked) {
        ribbonHTML = `<span class="cast-status-ribbon ribbon-cost-locked">雅不足（要${deployCost + 1}以上）</span>`;
      }

      // SSRコストバッジ表示
      const costPillHTML =
        deployCost > 0
          ? `<span class="ssr-cost-pill">配置：雅-${deployCost}</span>`
          : "";

      // 3属性（話術・舞踊・座興）の強調判定（3以上を強調）
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
        ${ribbonHTML}
        <div class="cast-top">
          <div class="cast-portrait" style="background: radial-gradient(circle at 50% 30%, ${cast.accentColor}55, #14151f)">
            ${portraitImgHTML}
            <span class="cast-portrait-kanji">${escapeHtml(cast.kanjiWatermark)}</span>
          </div>
          <div class="cast-meta">
            <span class="cast-role-tag">${escapeHtml(cast.title)}${costPillHTML}</span>
            <h4 class="cast-name">${escapeHtml(cast.name)}</h4>
          </div>
        </div>
        <div class="cast-trait-box">
          <span class="cast-trait-title">【${escapeHtml(cast.traitName)}】</span>
          <p class="cast-trait">${escapeHtml(cast.traitDesc)}</p>
        </div>
        <div class="cast-stats-row">
          ${statsHTML}
        </div>
      `;

      // ドラッグ開始イベント
      card.addEventListener("dragstart", (e) => {
        if (isDisabled) {
          e.preventDefault();
          return;
        }
        state.selectedCastId = cast.id;
        e.dataTransfer.setData("text/plain", cast.id);
        e.dataTransfer.effectAllowed = "move";
      });

      // クリック選択イベント
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

    // 呼び鈴ボタンの有効・無効とラベル更新（雅を1消費）
    if (dom.btnBellRedraw) {
      const cost = DATA.config.bellSpiritCost || 1;
      const assignedCount = Object.values(state.roomState).filter((r) => r.assignedCastId).length;
      const hasUnplaced = state.handCastIds.length > assignedCount;
      const canUseBell = isAssign && !state.bellUsedThisNight && state.spirit > cost && hasUnplaced;

      dom.btnBellRedraw.disabled = !canUseBell;
      if (state.bellUsedThisNight) {
        dom.btnBellRedraw.textContent = "🔔 呼び鈴（今宵は使用済）";
      } else if (state.spirit <= cost) {
        dom.btnBellRedraw.textContent = `🔔 呼び鈴（雅不足 / 要${cost + 1}以上）`;
      } else {
        dom.btnBellRedraw.textContent = `🔔 呼び鈴（手札入替 / 雅-${cost}）`;
      }
    }

    if (state.selectedCastId) {
      const c = DATA.casts.find((item) => item.id === state.selectedCastId);
      dom.selectionHint.textContent = `【${c.fullName}】を選択中 ― 配置したいお座敷をクリックしてください`;
    } else {
      dom.selectionHint.textContent =
        "カードをお座敷へドラッグ＆ドロップ、またはクリックで選択して配置してください（最大3名）";
    }
  }

  /* ==========================================================================
     モーダル表示（夜明け・エンディング・ゲームオーバー）
     ========================================================================== */
  function showDawnModal() {
    state.phase = "modal";
    const nightLabel = NIGHT_LABELS[state.night - 1];
    const nextNightLabel = NIGHT_LABELS[state.night];

    dom.modalWatermark.textContent = "暁";
    dom.modalSubtitle.textContent = "― 夜明け ―";
    dom.modalTitle.textContent = `${nightLabel} 明け`;

    const restingCasts = DATA.casts
      .filter((c) => (state.castCooldowns[c.id] || 0) > 0)
      .map((c) => c.fullName);

    const restNote =
      restingCasts.length > 0
        ? `<br><small style="color:#e6a15c;">※${restingCasts.join("・")}は全力接客の疲れにより、次の一夜は休息のため山札から外れます。</small>`
        : "";

    const difficultyNote =
      state.night === 2
        ? `<br><small style="color:#ff9e9e;">※第三夜以降は、複合要求や目の肥えた常連・大旦那が訪れやすくなります。</small>`
        : "";

    dom.modalBody.innerHTML = `
      東の空が白み始め、お座敷の客人たちは満足げに夜明けの道へ帰っていきました。<br>
      次の夕暮れには、また新たな待機の誘魅（いざなみ）4名が帳場へ揃います。${restNote}${difficultyNote}
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

  function showEndingModal() {
    state.phase = "modal";
    dom.modalWatermark.textContent = "祝";
    dom.modalSubtitle.textContent = "― 全五夜 完遂 ―";
    dom.modalTitle.textContent = "彼岸旅館『逢曲時』大繁盛記";

    dom.modalBody.innerHTML = `
      五夜にわたるお座敷を見事に切り盛りし、宿には清々しい朝日が差し込みました。<br>
      粋な歓談、華やかな舞踊、賑やかな座興――八名の誘魅（いざなみ）とあなたの采配により、「逢曲時」は現世と常世で随一の名旅館として語り継がれることでしょう！<br>
      <strong>― 全五夜おもてなし完遂、誠にお見事でした ―</strong>
    `;

    dom.modalStatsSummary.innerHTML = `
      <span>🏮 最終評判：<strong>${state.reputation}</strong></span>
      <span>🪭 最終雅：<strong>${state.spirit}</strong></span>
    `;

    dom.btnModalNext.textContent = "第一夜から再び遊ぶ";
    dom.btnModalNext.onclick = () => {
      dom.resultModal.classList.add("hidden");
      initGame();
    };

    dom.resultModal.classList.remove("hidden");
  }

  function showGameOverModal() {
    state.phase = "modal";
    dom.modalWatermark.textContent = "閉";
    dom.modalSubtitle.textContent = "― お座敷閉鎖 ―";
    dom.modalTitle.textContent = "帳場の灯が消える";

    const reason =
      state.reputation <= 0
        ? "宿の『評判』がすっかり落ちてしまい、お座敷へ足を運ぶ客人はいなくなってしまいました……。"
        : "お座敷の風流さと情緒を表す『雅（みやび）』が失われ、彼岸旅館としての粋な魅力が途絶えてしまいました……。";

    dom.modalBody.innerHTML = `
      ${reason}<br>
      行灯の火は消え、帳場録はここで途絶えてしまいました。<br>
      お座敷ごとのボーナスや「帳場の呼び鈴」、各誘魅（いざなみ）の特技を活かして再び挑戦してみてください。
    `;

    dom.modalStatsSummary.innerHTML = `
      <span>🏮 最終評判：<strong>${state.reputation}</strong></span>
      <span>🪭 最終雅：<strong>${state.spirit}</strong></span>
    `;

    dom.btnModalNext.textContent = "帳場をやり直す（リトライ）";
    dom.btnModalNext.onclick = () => {
      dom.resultModal.classList.add("hidden");
      initGame();
    };

    dom.resultModal.classList.remove("hidden");
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
     背景Canvas演出（ゆらめく狐火＆舞い散る彼岸花の花弁）
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
    const count = 32;

    for (let i = 0; i < count; i++) {
      const isFoxfire = i % 2 === 0;
      particles.push({
        type: isFoxfire ? "foxfire" : "petal",
        x: Math.random() * width,
        y: Math.random() * height,
        r: isFoxfire ? 2 + Math.random() * 4 : 3 + Math.random() * 3.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: isFoxfire ? -(0.2 + Math.random() * 0.45) : 0.35 + Math.random() * 0.55,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.02,
        alpha: 0.25 + Math.random() * 0.45
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.angle += p.spin;
        p.x += p.vx + Math.sin(p.angle) * 0.25;
        p.y += p.vy;

        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.save();
        if (p.type === "foxfire") {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
          glow.addColorStop(0, `rgba(230, 161, 92, ${p.alpha})`);
          glow.addColorStop(0.5, `rgba(214, 56, 100, ${p.alpha * 0.35})`);
          glow.addColorStop(1, "rgba(18, 19, 26, 0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillStyle = `rgba(201, 42, 42, ${p.alpha * 0.85})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r * 1.4, p.r * 0.55, 0, 0, Math.PI * 2);
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

  initBackgroundParticles();
  // 背景のゲーム盤面も初期描画しておき、遊び方画面から「帳場を開く」で新規ゲームを開始する
  initGame();
})();
