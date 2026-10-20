/**
 * 『逢曲時 帳場録（おうまがどき ちょうばろく）』データ定義ファイル
 * ― 彼岸旅館「逢曲時」お座敷遊び・歓談・舞踊のおもてなし版 ―
 *
 * 画像の差し替え方法:
 * 各オブジェクトの `imagePath` に画像ファイルへのパス（例: 'assets/cast_tokoyo.png'）を設定すると、
 * CSSプレースホルダーの代わりにその画像が表示されます。
 * 空文字（""）の場合や画像の読み込みに失敗した場合は、自動的に和風プレースホルダーにフォールバックします。
 */

window.GAME_DATA = {
  // ゲーム基本設定（全5夜・山札から4枚ドロー）
  config: {
    maxNights: 5,
    handSize: 4,
    initialReputation: 3, // 評判の初期値（0でゲームオーバー）
    maxReputation: 5,     // 評判の最大値
    initialSpirit: 4,     // 雅（みやび）の初期値（0でゲームオーバー）
    maxSpirit: 5,         // 雅（みやび）の最大値
    bellSpiritCost: 1     // 「帳場の呼び鈴（手札入替）」の消費する雅
  },

  // 属性（パラメータ）の表示名とアイコン・色定義
  statsMeta: {
    talk: {
      id: "talk",
      name: "話術",
      icon: "💬",
      kanji: "話",
      color: "#3b7a9e",
      desc: "客人の身の上話を粋に受け止め、心地よい語らいで座を和ませる技"
    },
    dance: {
      id: "dance",
      name: "舞踊",
      icon: "🪭",
      kanji: "舞",
      color: "#d63864",
      desc: "扇や袂を翻し、華やかな舞姿でお座敷の客人を魅了する芸事"
    },
    party: {
      id: "party",
      name: "座興",
      icon: "🍶",
      kanji: "興",
      color: "#d4942a",
      desc: "お酌や三味線、お座敷遊びで宴席を賑やかに盛り上げるおもてなし"
    }
  },

  // 客室データ（3部屋）
  rooms: [
    {
      id: "room_stage",
      name: "大広間・舞台",
      reading: "おおひろま・ぶたい",
      kanjiWatermark: "舞",
      imagePath: "", // 例: "assets/room_stage.jpg"
      themeColor: "#8c2b46",
      bonusStat: "dance",
      bonusValue: 1,
      affinityCastId: "cast_haruka", // 舞姫・ハルカ配置でさらに+1
      affinityBonusValue: 1,
      description: "百目蝋燭が照らす檜舞台を備えた大広間。華やかな舞姿がひときわ映える。",
      bonusText: "部屋効果：🪭【舞踊】+1（ハルカ:+2 / にゃる:+3）"
    },
    {
      id: "room_parlor",
      name: "離れの小座敷",
      reading: "はなれのこざしき",
      kanjiWatermark: "語",
      imagePath: "", // 例: "assets/room_parlor.jpg"
      themeColor: "#2f5d73",
      bonusStat: "talk",
      bonusValue: 1,
      affinityCastId: "cast_marin", // 見習い・まりん配置でさらに+1
      affinityBonusValue: 1,
      description: "行灯の灯りが揺れる落ち着いた小座敷。しんみりとした歓談や密談に最適。",
      bonusText: "部屋効果：💬【話術】+1（まりん:+2 / にゃる:+3）"
    },
    {
      id: "room_banquet",
      name: "月見の宴席",
      reading: "つきみのえんせき",
      kanjiWatermark: "盃",
      imagePath: "", // 例: "assets/room_banquet.jpg"
      themeColor: "#8c6223",
      bonusStat: "party",
      bonusValue: 1,
      affinityCastId: "cast_naraku", // 粋人・ならく配置でさらに+1
      affinityBonusValue: 1,
      description: "彼岸の満月を望む開放的な縁側座敷。三味線とお酒で賑やかな座興が弾む。",
      bonusText: "部屋効果：🍶【座興】+1（ならく:+2 / にゃる:+3）"
    }
  ],

  // キャスト（山札：全8名）
  // `image/` フォルダ内の画像ファイル名に対応（存在しないファイルは自動的にCSSプレースホルダーにフォールバックします）
  casts: [
    // 1. 筆頭・常世（SSR特別枠・配置時に雅コスト1）
    {
      id: "cast_tokoyo",
      name: "常世",
      title: "筆頭",
      fullName: "筆頭・常世",
      kanjiWatermark: "常",
      imagePath: "image/tokoyo.png",
      accentColor: "#e6b422",
      isSpecialSSR: true,
      deploySpiritCost: 1, // 配置時に「雅」を1消費（解除時に+1返却）
      stats: {
        talk: 4,
        dance: 4,
        party: 4
      },
      passiveType: "deploy_cost_spirit",
      traitName: "女将の威光",
      traitDesc: "全能力4の最高峰の筆頭。配置時に「雅」を1消費する（解除で返却・雅1以下は配置不可）",
      cooldownTurns: 0,
      quote: "「彼岸旅館『逢曲時』の筆頭として、どのような客人にも極上の夢をお見せしましょう」"
    },
    // 2. 舞姫・ハルカ
    {
      id: "cast_haruka",
      name: "ハルカ",
      title: "舞姫",
      fullName: "舞姫・ハルカ",
      kanjiWatermark: "扇",
      imagePath: "image/haruka.png",
      accentColor: "#d63864",
      stats: {
        talk: 1,
        dance: 4,
        party: 2
      },
      passiveType: "room_affinity",
      traitName: "華の舞",
      traitDesc: "舞台に立てば誰もが息を呑む、旅館随一の舞い手（大広間・舞台でさらに【舞踊】+1）",
      cooldownTurns: 0,
      quote: "「金扇ひとたび翻せば、常世の夢へと誘いましょう。どうぞご覧くださいませ」"
    },
    // 3. 粋人・ならく
    {
      id: "cast_naraku",
      name: "ならく",
      title: "粋人",
      fullName: "粋人・ならく",
      kanjiWatermark: "粋",
      imagePath: "image/naraku.png",
      accentColor: "#d4942a",
      stats: {
        talk: 2,
        dance: 1,
        party: 4
      },
      passiveType: "room_affinity",
      traitName: "宴の達人",
      traitDesc: "お酌から遊興まで宴席を盛り上げる達人（月見の宴席でさらに【座興】+1）",
      cooldownTurns: 0,
      quote: "「さあさあ一献！ 今宵の宴席は私めが賑やかにお回しいたしますぞ！」"
    },
    // 4. 見習い・まりん（話術4のスペシャリスト・休み制限なし）
    {
      id: "cast_marin",
      name: "まりん",
      title: "見習い",
      fullName: "見習い・まりん",
      kanjiWatermark: "純",
      imagePath: "image/marin.png",
      accentColor: "#3b7a9e",
      stats: {
        talk: 4,
        dance: 1,
        party: 2
      },
      passiveType: "room_affinity",
      traitName: "天性の愛嬌",
      traitDesc: "一生懸命なトークでお客の心を掴む話術のスペシャリスト（離れの小座敷でさらに【話術】+1）",
      cooldownTurns: 0,
      quote: "「お喋りなら任せてくださいっ！ どんなお客さまともすぐに仲良くなってみせますね！」"
    },
    // 5. 看板娘・月下香
    {
      id: "cast_gekkakou",
      name: "月下香",
      title: "看板娘",
      fullName: "看板娘・月下香",
      kanjiWatermark: "香",
      imagePath: "image/gekkakou.png",
      accentColor: "#e06d9f",
      stats: {
        talk: 3,
        dance: 3,
        party: 1
      },
      passiveType: "bonus_reputation_on_success",
      passiveValue: 1,
      traitName: "華やかな笑顔",
      traitDesc: "おもてなし成功時、「評判」を追加で+1回復する",
      cooldownTurns: 0,
      quote: "「宵闇に咲く花の香りとともに、お座敷に華を添えてみせますわ」"
    },
    // 6. 姉御肌・たまも
    {
      id: "cast_tamamo",
      name: "たまも",
      title: "姉御肌",
      fullName: "姉御肌・たまも",
      kanjiWatermark: "姉",
      imagePath: "image/tamamo.png",
      accentColor: "#b85d19",
      stats: {
        talk: 3,
        dance: 1,
        party: 3
      },
      passiveType: "reduce_penalty_on_fail",
      passiveValue: 1,
      traitName: "粋な計らい",
      traitDesc: "おもてなし失敗時でも、場を取り繕いペナルティを1軽減する",
      cooldownTurns: 0,
      quote: "「ちょっと座が白けたくらいで慌てないの！ あたしが上手く取り成しとくよ！」"
    },
    // 7. 歌姫・るちゃ
    {
      id: "cast_rucha",
      name: "るちゃ",
      title: "歌姫",
      fullName: "歌姫・るちゃ",
      kanjiWatermark: "唄",
      imagePath: "image/rucha.png",
      accentColor: "#9b59b6",
      stats: {
        talk: 1,
        dance: 3,
        party: 3
      },
      passiveType: "bonus_spirit_on_success",
      passiveValue: 1,
      traitName: "風流な調べ",
      traitDesc: "おもてなし成功時、「雅」を追加で+1回復する",
      cooldownTurns: 0,
      quote: "「三味線の音色に乗せて一節唄えば、お座敷の雅やかな情緒がいっそう深まりますよ」"
    },
    // 8. 帳場頭・にゃる
    {
      id: "cast_nyaru",
      name: "にゃる",
      title: "帳場頭",
      fullName: "帳場頭・にゃる",
      kanjiWatermark: "統",
      imagePath: "image/nyaru.png",
      accentColor: "#c92a2a",
      stats: {
        talk: 2,
        dance: 2,
        party: 2
      },
      passiveType: "room_bonus_override",
      passiveValue: 3, // 部屋のボーナス効果を+1ではなく+3として計算（2+3=5）
      traitName: "座敷の采配",
      traitDesc: "配置した客室のボーナス効果を「+1」ではなく「+3」として計算する",
      cooldownTurns: 0,
      quote: "「この宿のしつらえは隅々まで知り尽くしておる。どの座敷でも最高の席に仕立てよう」"
    }
  ],

  // 来訪者（お座敷の客人）カードデータ（全10種類・単一および複合要求対応）
  // requirements: [{ stat: 'talk'|'dance'|'party', value: number }, ...]
  // reward / penalty: { reputation, spirit } ※内部キー spirit を UI 上「雅（みやび）」として表示
  visitors: [
    // 1. 迷い込んだ旅人
    {
      id: "vis_traveler",
      name: "迷い込んだ旅人",
      category: "宵の旅人",
      kanjiWatermark: "旅",
      imagePath: "",
      requirements: [{ stat: "talk", value: 3 }],
      tier: "early",
      difficulty: "易",
      reward: { reputation: 1, spirit: 0 },
      penalty: { reputation: -1, spirit: 0 },
      desc: "夕霧の中で行灯の灯りに誘われて訪れた旅人。旅の疲れを癒やす温かな語らいを求めている。",
      successFlavor: "親身な相槌に旅人の緊張がほぐれ、楽しい会話にお座敷が温かく和んだ。",
      failFlavor: "話の糸口が見つからず気まずい沈黙が流れ、旅人は居心地悪そうに席を立ってしまった……。"
    },
    // 2. 舞を所望する貴人
    {
      id: "vis_dancelover",
      name: "舞を所望する貴人",
      category: "風流貴賓",
      kanjiWatermark: "扇",
      imagePath: "",
      requirements: [{ stat: "dance", value: 3 }],
      tier: "early",
      difficulty: "普",
      reward: { reputation: 0, spirit: 1 },
      penalty: { reputation: 0, spirit: -1 },
      desc: "彼岸旅館の舞が名高いと聞きつけて訪れた貴人。優雅な扇の舞を心待ちにしている。",
      successFlavor: "鮮やかな舞姿に貴人から感嘆の吐息が漏れ、お座敷に雅やかな拍手が響き渡った！",
      failFlavor: "足運びの乱れに貴人は扇で顔を隠し、座の風流な空気が白けてしまった……。"
    },
    // 3. 宵待ちの酒豪
    {
      id: "vis_drinker",
      name: "宵待ちの酒豪",
      category: "酒客",
      kanjiWatermark: "酌",
      imagePath: "",
      requirements: [{ stat: "party", value: 3 }],
      tier: "early",
      difficulty: "普",
      reward: { reputation: 1, spirit: 0 },
      penalty: { reputation: 0, spirit: -1 },
      desc: "銘酒と賑やかな座興を求めてやってきた上客。テンポの良いお酌と遊びを好む。",
      successFlavor: "絶妙な頃合いのお酌とお座敷遊びにお酒がぐんぐん進み、豪快な笑い声が響いた！",
      failFlavor: "お銚子の替え時を逃してしまい、客人は手持ち無沙汰に溜息をついてしまった……。"
    },
    // 4. 目の肥えた大旦那
    {
      id: "vis_patron",
      name: "目の肥えた大旦那",
      category: "大尽客",
      kanjiWatermark: "極",
      imagePath: "",
      requirements: [{ stat: "dance", value: 5 }],
      tier: "high",
      difficulty: "難",
      reward: { reputation: 2, spirit: 1 },
      penalty: { reputation: -2, spirit: 0 },
      desc: "数々の名席を見届けてきた大旦那。並の舞では満足しないため、大広間・舞台の地の利が必須。",
      successFlavor: "「これぞ逢曲時の至芸よ！」大旦那は感極まって総立ちで拍手し、弾んだ祝儀を授けてくれた！",
      failFlavor: "「期待外れじゃな」大旦那は厳しく眉をひそめ、宿の評判に大きな傷がついてしまった……！"
    },
    // 5. 微行のお忍び客
    {
      id: "vis_incognito",
      name: "微行のお忍び客",
      category: "お忍び貴賓",
      kanjiWatermark: "忍",
      imagePath: "",
      requirements: [{ stat: "talk", value: 4 }],
      tier: "mid",
      difficulty: "高",
      reward: { reputation: 0, spirit: 2 },
      penalty: { reputation: -1, spirit: 0 },
      desc: "身分を隠して静かに羽を伸ばしに来た高貴な客人。詮索せず粋に話し相手を務める高い話術が要る。",
      successFlavor: "粋で奥ゆかしい歓談にお忍び客は深く心を許し、お座敷は極上の雅趣に包まれた！",
      failFlavor: "無粋な問いかけに客人は表情を曇らせ、早々に席を切り上げて帰ってしまった……。"
    },
    // 6. 狐面の風流人（複合要求：話術3 かつ 舞踊3）
    {
      id: "vis_foxconnoisseur",
      name: "狐面の風流人",
      category: "常世の粋人",
      kanjiWatermark: "雅",
      imagePath: "",
      requirements: [
        { stat: "talk", value: 3 },
        { stat: "dance", value: 3 }
      ],
      tier: "high",
      difficulty: "複合",
      reward: { reputation: 2, spirit: 0 },
      penalty: { reputation: -1, spirit: 0 },
      desc: "洒落た狐面を着けた風流人。機知に富んだ【話術】と優美な【舞踊】の両方を同時に求めている。",
      successFlavor: "軽妙な語らいと華麗な舞の掛け合いに風流人は大喝采！宿の名声が大きく広まった！",
      failFlavor: "語らいか舞のどちらかが物足りず、風流人は「まだ修行が足りぬな」と肩をすくめた。"
    },
    // 7. 賑やかな旦那衆（複合要求：座興3 かつ 話術3）
    {
      id: "vis_merchants",
      name: "賑やかな旦那衆",
      category: "大座敷の団体",
      kanjiWatermark: "宴",
      imagePath: "",
      requirements: [
        { stat: "party", value: 3 },
        { stat: "talk", value: 3 }
      ],
      tier: "high",
      difficulty: "複合",
      reward: { reputation: 0, spirit: 2 },
      penalty: { reputation: 0, spirit: -2 },
      desc: "景気よく騒ぎに来た旦那衆の一行。座を回す【座興】と全員を楽しませる【話術】が同時に試される。",
      successFlavor: "手拍子と笑いが絶えない大宴会となり、お座敷の雅な熱気が最高潮に達した！",
      failFlavor: "座が上手く回らず旦那衆が退屈し始め、お座敷の雰囲気がすっかり白けてしまった……！"
    },
    // 8. おっとりした童子（ラッキー枠）
    {
      id: "vis_child",
      name: "おっとりした童子",
      category: "福客",
      kanjiWatermark: "福",
      imagePath: "",
      requirements: [{ stat: "talk", value: 2 }],
      tier: "early",
      difficulty: "福",
      reward: { reputation: 1, spirit: 1 },
      penalty: { reputation: 0, spirit: 0 },
      desc: "美味しいお菓子と昔話を楽しみに来た可愛らしい客人。少し話し相手になるだけで福を運んでくれる。",
      successFlavor: "「とっても楽しかったよ！」童子がにっこり笑うと、お座敷に穏やかな福運と雅が満ちた！",
      failFlavor: "童子は少し眠そうに目をこすりながら、お土産の饅頭を抱えて静かに帰っていった（被害なし）。"
    },
    // 9. 粋を好む遊び人
    {
      id: "vis_playboy",
      name: "粋を好む遊び人",
      category: "通人",
      kanjiWatermark: "通",
      imagePath: "",
      requirements: [{ stat: "party", value: 2 }],
      tier: "early",
      difficulty: "易",
      reward: { reputation: 0, spirit: 1 },
      penalty: { reputation: -1, spirit: 0 },
      desc: "お座敷遊びのイロハを心得た遊び人。ちょっとした投扇興や三味線の余興を所望している。",
      successFlavor: "気の利いたお座敷遊びに遊び人はニヤリと頷き、風流な一夜を満喫してくれた。",
      failFlavor: "「少し野暮ったいねえ」と遊び人に苦笑いされ、評判を少し落としてしまった……。"
    },
    // 10. 千夜の常連客（高難度：座興5）
    {
      id: "vis_regular",
      name: "千夜の常連客",
      category: "最上客",
      kanjiWatermark: "千",
      imagePath: "",
      requirements: [{ stat: "party", value: 5 }],
      tier: "high",
      difficulty: "極",
      reward: { reputation: 2, spirit: 1 },
      penalty: { reputation: -2, spirit: 0 },
      desc: "千の夜にわたり逢曲時へ通い詰める伝説の常連。最高峰の【座興5】（月見の宴席＋常世／ならく／にゃる）で迎えよ。",
      successFlavor: "「やはり逢曲時の宴は日本一じゃ！」常連客は満面の笑みで盃を掲げ、宿に最高の誉れをもたらした！",
      failFlavor: "「今宵の座敷はどうにも締まらんな……」常連客をがっかりさせ、評判が大きく揺らいでしまった！"
    }
  ],

  // おもてなし成功時のミニ会話カットイン定義（キャスト8名 × 来訪者10種対応）
  hospitalityDialogues: {
    // 1. 筆頭・常世（全能力4の最高峰）
    cast_tokoyo: {
      defaultCastLine: "「筆頭の常世でございます。話術・舞踊・座興、いかなるご所望にも最高峰の芸でお応えしましょう」",
      byVisitor: {
        vis_traveler: {
          castLine: "「夜霧の中をよくぞお越しで。まずは温かいお茶と、旅路のお話を聞かせていただけますか？」",
          visitorLine: "「なんと、館の筆頭自らお相手くださるとは……！ 穏やかな声に長旅の疲れがすっと溶けていくよ」",
          narration: "常世の気品あふれる微笑みと相槌に、旅人は極上の安らぎに包まれた。"
        },
        vis_patron: {
          castLine: "「大旦那さま、今宵は私が直々に舞台へ立ちましょう。――彼岸旅館に伝わる秘舞、とくとご覧あれ」",
          visitorLine: "「おおっ、常世殿の舞を生で拝めるとは千載一遇の誉れ！ まさに神業のごとき美しさじゃ！」",
          narration: "筆頭・常世の圧倒的な舞姿に大旦那は感極まり、お座敷中が割れんばかりの喝采に包まれた！"
        },
        vis_regular: {
          castLine: "「千夜の常連さま、長きにわたるご贔屓に感謝いたします。今宵は私が直々にお酌と座興を務めましょう」",
          visitorLine: "「うむむ、常世殿が直々に席へ出るとはな！ これ以上の贅沢は常世にも現世にもないわい！」",
          narration: "館のトップである常世の歓待に常連客は感激し、宿の名声は揺るぎないものとなった！"
        },
        vis_foxconnoisseur: {
          castLine: "「風流人さまのお眼鏡に適うよう、古今の歌物語に優美な舞を添えてご覧に入れましょう」",
          visitorLine: "「立て板に水の話術に一分の隙もない舞姿！ さすがは逢曲時の筆頭、非の打ち所がない！」",
          narration: "狐面の風流人は深く感嘆し、常世の威光と粋を常世の隅々まで語り広めた。"
        },
        vis_merchants: {
          castLine: "「旦那衆の皆さま、今宵は筆頭の私が座を仕切らせていただきます。さあ、順にお酌へ参りますよ」",
          visitorLine: "「ひゃあ、常世さま直々のお酌とは恐れ入る！ 座敷の格が一気に上がったぞ、乾杯じゃーっ！」",
          narration: "女将の威光と鮮やかな座回しで、旦那衆の宴席はかつてないほどの格式と熱気に満ちた。"
        },
        vis_incognito: {
          castLine: "「野暮な詮索は無粋というもの。今宵はただ、季節の移ろいと月の美しさだけを語り合いましょう」",
          visitorLine: "「ふふ、流石は逢曲時の筆頭。お主といると肩の荷を下ろして心から寛げるわ」",
          narration: "常世の細やかな気遣いにお忍び客は深く感銘を受け、座敷に気品ある雅が満ちた。"
        }
      }
    },

    // 2. 舞姫・ハルカ
    cast_haruka: {
      defaultCastLine: "「檜舞台に咲く一輪の華として、今宵の皆さまを夢幻の舞へと誘いましょう」",
      byVisitor: {
        vis_dancelover: {
          castLine: "「貴人さま、今宵は彼岸に舞う紅き花弁を模した『恋慕の扇舞』をご覧に入れます」",
          visitorLine: "「なんと艶やかで凛とした舞姿か……！ 瞬きするのも惜しいほどの美しさじゃ！」",
          narration: "ハルカが最後の決めポーズを取ると、客室には割れんばかりの拍手と歓声が巻き起こった。"
        },
        vis_patron: {
          castLine: "「大旦那さまの肥えたお目にも必ずや応えてみせましょう。――いざ、逢曲時秘伝の『月下千鶴の舞』！」",
          visitorLine: "「うむむ……天晴れ！ 袖の翻りから指先の角度まで一点の曇りもない、極上の舞を見せてもらった！」",
          narration: "目の肥えた大旦那も思わず唸る至高の舞台となり、お座敷中が感動の渦に包まれた！"
        },
        vis_playboy: {
          castLine: "「舞のあとには、少しばかりお座敷遊びのお相手もいたしましょう。さあ、扇を構えてくださいませ」",
          visitorLine: "「へえ、舞台の上だけじゃなく座興も心得てるとはね！ ハルカちゃんの扇さばき、見事だよ」",
          narration: "舞姫ならではの優雅な投扇興にお座敷が華やぎ、遊び人も大満足で頷いた。"
        }
      }
    },

    // 3. 粋人・ならく
    cast_naraku: {
      defaultCastLine: "「粋な遊びに旨い酒！ 今宵のお座敷は、このならくが最高に盛り上げてみせましょう！」",
      byVisitor: {
        vis_drinker: {
          castLine: "「おっと旦那、盃が空でございますぞ！ 今宵は月見酒にぴったりの古酒を開けました、さあグイッと！」",
          visitorLine: "「くぅーっ、五臓六腑に染み渡る！ ならく殿のお酌で飲む酒はどうしてこうも旨いのかのう！」",
          narration: "絶妙な合いの手とお酌にお酒が次々と空になり、最高に陽気な宴席となった。"
        },
        vis_merchants: {
          castLine: "「旦那衆、ここからはお座敷拳と参りましょうか！ 負けた方には特大の盃が待っておりますぞ！」",
          visitorLine: "「ガハハハ！ ならく殿の司会はいつ見ても鮮やかじゃ！ 今夜は朝まで飲んで騒ぐぞーっ！」",
          narration: "座興と話術を駆使したならくの独壇場に、旦那衆のお座敷は笑いの渦に包まれた！"
        },
        vis_playboy: {
          castLine: "「おや、通なお客さま。今宵は投扇興で私めと一勝負いかがでしょう？ 手加減はいたしませんぞ」",
          visitorLine: "「へえ、良い手つきじゃないか！ あんたみたいな粋人が相手なら、幾夜でも遊びたくなるねえ」",
          narration: "丁々発止のお座敷遊びに座はたいそう盛り上がり、風流な拍手が響いた。"
        },
        vis_regular: {
          castLine: "「千夜の常連さま、いつもご贔屓に！ 今宵はこれまでの千夜を超える、極上の大座興をご用意いたしました！」",
          visitorLine: "「見事じゃならく！ 軽妙な口上といい酒の回し方といい、やはりお主の座敷は天下一品よ！」",
          narration: "月見の宴席と一体になった至高の座興に、常連客はかつてない満足感を浮かべて頷いた！"
        }
      }
    },

    // 4. 見習い・まりん（話術4のスペシャリスト）
    cast_marin: {
      defaultCastLine: "「見習いのまりんです！ とびきりの笑顔とお喋りで、お客さまの心をぽかぽかにしちゃいますね！」",
      byVisitor: {
        vis_traveler: {
          castLine: "「旅のお客さま、遠路はるばるお疲れさまでした！ 道中のお話、わたしにたーっぷり聞かせてくださいっ！」",
          visitorLine: "「ありがとう、まりんちゃんが目を輝かせて聞いてくれるから、ついつい話が弾んでしまうよ」",
          narration: "まりんの天性の愛嬌とトーク力に、旅人は心から打ち解けて笑顔を見せた。"
        },
        vis_incognito: {
          castLine: "「むずかしい肩書きは抜きにして、今夜はただの旅人さんとして、わたしと楽しい世間話をしましょう♪」",
          visitorLine: "「ははっ、お主のように裏表のない娘と話していると、日頃の政務の疲れもすっかり吹き飛ぶわ」",
          narration: "飾らない一生懸命なトークがお忍び客の心を掴み、小座敷に穏やかな雅が満ち溢れた！"
        },
        vis_child: {
          castLine: "「わあ、可愛いお客さま！ わたしとっておきの面白い昔話をたくさん知ってるんだよ、聞いて聞いて！」",
          visitorLine: "「わあーい！ まりんお姉ちゃんのお話、すっごく面白くて大好き！」",
          narration: "二人の弾むような笑い声がお座敷に響き、宿に清らかな福運が舞い込んだ。"
        },
        vis_merchants: {
          castLine: "「旦那衆の皆さま、お酌をしながら皆さまの武勇伝をぜひ聞かせてくださいませー！」",
          visitorLine: "「おうおう、まりんちゃんは本当に聞き上手で愛嬌抜群じゃな！ つい酒も話も進んでしまうわい！」",
          narration: "まりんの明るいトークが座を繋ぎ、旦那衆の宴席は大いに盛り上がった。"
        }
      }
    },

    // 5. 看板娘・月下香
    cast_gekkakou: {
      defaultCastLine: "「看板娘の月下香でございます。華やかな笑顔と舞で、忘れ得ぬ一夜をお届けいたしますわ」",
      byVisitor: {
        vis_traveler: {
          castLine: "「まあ、夜露に濡れて大変でしたでしょう。香り高い花酒と私の小話で、どうぞ温まってくださいませ」",
          visitorLine: "「うわあ、噂に聞く看板娘の月下香さんにお会いできるなんて……！ 最高の旅の思い出になります！」",
          narration: "月下香の華やかな笑顔に旅人はすっかり魅了され、宿の評判を街中で語り広めた。"
        },
        vis_dancelover: {
          castLine: "「貴人さま、今宵は月下美人の香りを纏わせた扇にて、優美なる夜の舞を披露いたしますわ」",
          visitorLine: "「おお、舞うたびに芳しい香りが座敷に広がるとは……！ 視覚も嗅覚も満たされる名演じゃ！」",
          narration: "看板娘ならではの華麗な演出に貴人は感嘆し、お座敷の評判がいっそう高まった。"
        },
        vis_foxconnoisseur: {
          castLine: "「粋なお客さまには、艶やかな都の恋歌と、月影の舞を合わせてお贈りいたしましょう」",
          visitorLine: "「話術よし、舞姿よし！ 逢曲時の看板娘の名に恥じぬ、完璧なお座敷であったぞ！」",
          narration: "複合要求を優雅にこなした月下香の手腕により、宿の評判はかつてないほど高まった！"
        },
        vis_incognito: {
          castLine: "「お忍びの夜こそ、誰にも邪魔されぬ甘い語らいを。どうぞ盃を傾けてくださいませ」",
          visitorLine: "「お主の気品ある振る舞いと華やかな笑顔には本当に癒やされる。また必ずお忍びで参ろう」",
          narration: "月下香の洗練されたおもてなしに、お忍び客は深い満足感を湛えて微笑んだ。"
        }
      }
    },

    // 6. 姉御肌・たまも
    cast_tamamo: {
      defaultCastLine: "「姉御肌のたまもにお任せあれ！ しんみりした話から賑やかなお座敷遊びまで、粋に回してみせるよ！」",
      byVisitor: {
        vis_drinker: {
          castLine: "「ほらほらお客さん、いい飲みっぷりだねえ！ あたしも一杯付き合うから、今夜はとことん飲もうじゃないか！」",
          visitorLine: "「わっはっは！ たまも姉さんの気風の良さは最高だな！ 酒がいくらあっても足りんわい！」",
          narration: "たまもの姉御肌な酌み交わしに座は大盛り上がり！ 気持ちの良い飲みっぷりで宴が弾んだ。"
        },
        vis_merchants: {
          castLine: "「旦那衆、お待たせ！ あたしが来たからには退屈なんてさせないよ、さあ三味線に合わせて手拍子だ！」",
          visitorLine: "「おおーっ、たまも姉御が来れば座敷がピシッと締まって盛り上がるな！ さすがの貫禄じゃ！」",
          narration: "抜群の座興と話術で旦那衆の心を掴み、お座敷は熱気と歓声に包まれた！"
        },
        vis_playboy: {
          castLine: "「お兄さん、粋な遊びがお好みかい？ ならあたしと狐拳で勝負といこうじゃないか！」",
          visitorLine: "「こりゃあ一本取られたね！ 姉さんの鮮やかな手さばきと軽口、すっかり惚れ込んだよ」",
          narration: "粋でテンポの良いお座敷遊びに、遊び人も大満足で拍手を送った。"
        }
      }
    },

    // 7. 歌姫・るちゃ
    cast_rucha: {
      defaultCastLine: "「歌姫のるちゃです。美しい調べと舞、そして賑やかな音曲でお座敷に雅な風を吹かせましょう」",
      byVisitor: {
        vis_dancelover: {
          castLine: "「貴人さま、今宵は私の端唄に合わせて舞う『宵待草の舞』をお楽しみくださいませ」",
          visitorLine: "「澄み渡る歌声に優美な舞が重なるとは……なんと贅沢で雅やかな舞台であろうか！」",
          narration: "るちゃの透き通る歌声と舞姿にお座敷は深く酔いしれ、格別な雅が満ち溢れた。"
        },
        vis_drinker: {
          castLine: "「美味しいお酒には良い唄がつきものですね。お銚子が空くまで、祝いの俗曲を唄いましょう♪」",
          visitorLine: "「いやあ、るちゃ殿の美声を肴に飲む酒はこの世の極楽じゃ！ もう一本頼むぞ！」",
          narration: "心地よい歌声と三味線の音色にお酒がすすみ、お座敷は風流な喜びに満たされた。"
        },
        vis_playboy: {
          castLine: "「通なお客さまには、粋な小唄と三味線の掛け合いでお相手いたしましょう」",
          visitorLine: "「いいねえ、その艶のある節回し！ お座敷の空気が一気に雅やかになったじゃないか」",
          narration: "るちゃの奏でる音曲が夜の座敷に溶け込み、宿の雅がいっそう高まった。"
        }
      }
    },

    // 8. 帳場頭・にゃる
    cast_nyaru: {
      defaultCastLine: "「帳場頭のにゃるだ。各座敷の趣向を最大限に活かし、極上のおもてなしを仕立ててみせよう」",
      byVisitor: {
        vis_patron: {
          castLine: "「大旦那、この大広間の照明と音響はすべて計算済みだ。舞台装置と一体となった渾身の舞をご覧あれ！」",
          visitorLine: "「ぬおおっ！？ 広間全体の襖絵と光が舞に呼応しておる！ 帳場頭の采配、恐るべしじゃ！」",
          narration: "にゃるが大広間・舞台の魅力を極限（+3）まで引き出し、目の肥えた大旦那を完全に唸らせた！"
        },
        vis_incognito: {
          castLine: "「この離れの小座敷は外の物音をすべて遮断してある。帳場頭として、誰にも知られぬ至福の歓談をお約束しよう」",
          visitorLine: "「なんと行き届いた配慮か……。部屋のしつらえから話の深さまで、まさに最高峰の席じゃ」",
          narration: "離れの小座敷の特性を最大限に活かした接客で、お忍び客から絶大な信頼を勝ち取った！"
        },
        vis_regular: {
          castLine: "「千夜の常連殿！ 今宵は月見の宴席の庭に百の行灯を浮かべ、宿を挙げての大座興をご用意したぞ！」",
          visitorLine: "「これほど壮大で粋な宴席は千夜通っても初めてじゃ！ にゃるよ、お主こそ最高の帳場頭よ！」",
          narration: "月見の宴席のボーナスを極限（+3）まで高めたにゃるの采配により、伝説の一夜が刻まれた！"
        },
        vis_foxconnoisseur: {
          castLine: "「座敷のしつらえを整えれば、語らいも舞も何倍にも引き立つ。さあ、逢曲時の粋をご堪能あれ」",
          visitorLine: "「うむ、部屋全体の空気づくりからして一級品じゃな。見事なおもてなしに感服したぞ」",
          narration: "帳場頭ならではの総合演出に風流人も深く頷き、宿の名声が大きく高まった。"
        }
      }
    }
  }
};
