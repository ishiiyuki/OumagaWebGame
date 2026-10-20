/**
 * 『逢曲時 帳場録（おうまがとき ちょうばろく）』データ定義ファイル
 * ― 彼岸旅館「逢曲時」おうまがとき 世界観準拠版 ―
 *
 * モチーフ世界観（https://oumagatoki.pages.dev/world）:
 * ・彼岸旅館「逢曲時（おうまがとき）」：現世と常世の狭間にある死者の店。様々な時代の死者や妖狐・鬼などのアヤカシが誘魅（女中・芸者）として集う。
 * ・目的：事故や病気、何かの拍子に魂が現世から離れて常世へ迷い込んでしまった人間達を、神楽（接客・舞・武芸・演奏）でもてなして魂を安定させ、竹林を割く坂“黄泉平坂（よもつひらさか）”から現世へ送り還すこと。
 * ・ヨモツヘグイ（黄泉戸喫）：おもてなし（鎮魂）に失敗したり悪霊の誘惑に呑まれたりすると、常世の飲食によって現世へ還れなくなり常世へ堕ちてしまう。
 * ・誘魅（いざなみ）：正式名称「誘魅巫女（いざなみのみこ）」。生前に罪を犯したり非業の死を遂げた人間や妖怪が贖罪のために変化した霊的存在。中には人間を魅了して黄泉国へ誘う悪霊もいる。
 * ・ヒガン石（ひがんせき）：誘魅が身に付ける宝石。魂の本質を映し、「善」に近い者は彼岸花のように紅く、「悪」に近い者は根の毒のように黒く染まる。
 * ・八つ槌車（やつづちぐるま）：女将・常世の生前の家の家紋。牛車の車輪と木製の槌をモチーフとし、提灯など随所にあしらわれる商売繁盛・幸運の紋。
 */

window.GAME_DATA = {
  // ゲーム基本設定（全5夜・山札から4枚ドロー）
  config: {
    maxNights: 5,
    handSize: 4,
    initialReputation: 3, // 宿の評判（八つ槌車の威信・0でゲームオーバー）
    maxReputation: 5,
    initialSpirit: 4,     // 神楽の雅（魂を鎮める霊威・0でゲームオーバー）
    maxSpirit: 5,
    bellSpiritCost: 1     // 「帳場の呼び鈴（手札入替）」の消費する雅
  },

  // 属性（神楽のおもてなし3芸）の表示名とアイコン・色定義
  statsMeta: {
    talk: {
      id: "talk",
      name: "話術",
      icon: "💬",
      kanji: "話",
      color: "#3b7a9e",
      desc: "迷い込んだ人間の身の上話や未練に寄り添い、語らいの言霊で彷徨う魂を鎮める接客術"
    },
    dance: {
      id: "dance",
      name: "舞踊",
      icon: "🪭",
      kanji: "舞",
      color: "#c92a42",
      desc: "扇や武芸・演舞など、本来は神を鎮めるための『神楽』によって迷い人の魂を安定させる芸事"
    },
    party: {
      id: "party",
      name: "座興",
      icon: "🍶",
      kanji: "興",
      color: "#d4af37",
      desc: "音曲や酌み交わしで座を沸かせ、ヨモツヘグイの闇に呑まれぬよう現世への活力を灯すおもてなし"
    }
  },

  // 客室データ（3部屋）
  rooms: [
    {
      id: "room_stage",
      name: "大広間・神楽舞台",
      reading: "おおひろま・かぐらぶたい",
      kanjiWatermark: "舞",
      imagePath: "",
      themeColor: "#8b1e2f",
      bonusStat: "dance",
      bonusValue: 1,
      affinityCastId: "cast_haruka", // 芸者・ハルカ配置でさらに+1
      affinityBonusValue: 1,
      description: "八つ槌車の提灯と百目蝋燭が照らす檜舞台。迷い人の魂を鎮める神楽舞がひときわ冴え渡る。",
      bonusText: "座敷効果：🪭【舞踊】+1（ハルカ:+2 / にゃる:+3）"
    },
    {
      id: "room_parlor",
      name: "竹林望む離れ座敷",
      reading: "ちくりんのぞむはなれざしき",
      kanjiWatermark: "語",
      imagePath: "",
      themeColor: "#2b5468",
      bonusStat: "talk",
      bonusValue: 1,
      affinityCastId: "cast_marin", // 女中・まりん配置でさらに+1
      affinityBonusValue: 1,
      description: "現世へ続く坂“黄泉平坂”の竹林を望む静謐な小座敷。迷い人の未練を解きほぐす語らいに最適。",
      bonusText: "座敷効果：💬【話術】+1（まりん:+2 / にゃる:+3）"
    },
    {
      id: "room_banquet",
      name: "彼岸月見の宴席",
      reading: "ひがんつきみのえんせき",
      kanjiWatermark: "盃",
      imagePath: "",
      themeColor: "#8c6923",
      bonusStat: "party",
      bonusValue: 1,
      affinityCastId: "cast_naraku", // 女中・ならく配置でさらに+1
      affinityBonusValue: 1,
      description: "紅き彼岸花と常世の満月を望む開放的な宴会場。奏楽と座興で迷い人の魂に熱気を灯す。",
      bonusText: "座敷効果：🍶【座興】+1（ならく:+2 / にゃる:+3）"
    }
  ],

  // 誘魅巫女（山札：全8名）
  casts: [
    // 1. 女将・常世（SSR特別枠・配置時に雅コスト1）
    {
      id: "cast_tokoyo",
      name: "常世",
      title: "女将",
      fullName: "女将・常世",
      kanjiWatermark: "常",
      imagePath: "image/tokoyo.png",
      accentColor: "#d4af37",
      isSpecialSSR: true,
      deploySpiritCost: 1, // 配置時に「雅」を1消費（解除時に+1返却）
      stats: {
        talk: 4,
        dance: 4,
        party: 4
      },
      passiveType: "deploy_cost_spirit",
      traitName: "女将の威光",
      traitDesc: "配置時に『雅』を1消費する（解除で返却／雅1以下は配置不可）",
      cooldownTurns: 0,
      quote: "「彼岸旅館『逢曲時』へようこそ。迷いし貴方の魂を浄化する演舞、どうぞ見惚れて無事に現世へお還りなさいませ」"
    },
    // 2. 芸者・ハルカ
    {
      id: "cast_haruka",
      name: "ハルカ",
      title: "芸者",
      fullName: "芸者・ハルカ",
      kanjiWatermark: "扇",
      imagePath: "image/haruka.png",
      accentColor: "#d63864",
      stats: {
        talk: 1,
        dance: 4,
        party: 2
      },
      passiveType: "room_affinity",
      traitName: "鎮魂の神楽舞",
      traitDesc: "「大広間・神楽舞台」に配置時、さらに【舞踊】+1（計+2）",
      cooldownTurns: 0,
      quote: "「外から見てたよ～呼んでみて～！ 私の神楽舞で、揺らぐ魂をぴたりと鎮めてあげるね」"
    },
    // 3. 女中・ならく
    {
      id: "cast_naraku",
      name: "ならく",
      title: "獄門鬼女中",
      fullName: "女中・ならく",
      kanjiWatermark: "鬼",
      imagePath: "image/naraku.png",
      accentColor: "#d4942a",
      stats: {
        talk: 2,
        dance: 1,
        party: 4
      },
      passiveType: "room_affinity",
      traitName: "獄門の歓待",
      traitDesc: "「彼岸月見の宴席」に配置時、さらに【座興】+1（計+2）",
      cooldownTurns: 0,
      quote: "「獄門の鬼、ならくじゃ。酒の肴はヒトの魂……くふふ、今宵は極上の宴席へご案内いたしましょう」"
    },
    // 4. 女中・まりん
    {
      id: "cast_marin",
      name: "まりん",
      title: "猫の誘魅",
      fullName: "女中・まりん",
      kanjiWatermark: "猫",
      imagePath: "image/marin.png",
      accentColor: "#3b7a9e",
      stats: {
        talk: 4,
        dance: 1,
        party: 2
      },
      passiveType: "room_affinity",
      traitName: "現世繋ぎの語らい",
      traitDesc: "「竹林望む離れ座敷」に配置時、さらに【話術】+1（計+2）",
      cooldownTurns: 0,
      quote: "「猫のイザナミ、まりんです！ 此岸（現世）のいろんなお話、わたしにたーっぷり聞かせてくださいね！」"
    },
    // 5. 女中・月下香（ちゅーべろーず）
    {
      id: "cast_gekkakou",
      name: "月下香",
      title: "強キ鬼女中",
      fullName: "女中・月下香",
      kanjiWatermark: "香",
      imagePath: "image/gekkakou.png",
      accentColor: "#c92a42",
      stats: {
        talk: 3,
        dance: 3,
        party: 1
      },
      passiveType: "bonus_reputation_on_success",
      passiveValue: 1,
      traitName: "逝きは宵々、還りは──",
      traitDesc: "おもてなし成功時、追加で『評判』+1を獲得する",
      cooldownTurns: 0,
      quote: "「逢曲時に棲む『強キ鬼』、月下香と申します。逝きは宵々、還りは──ふふ、今宵はどちらの夢を見ましょうか」"
    },
    // 6. 女中・玉藻（たまも）
    {
      id: "cast_tamamo",
      name: "玉藻",
      title: "蒼き九尾",
      fullName: "女中・玉藻",
      kanjiWatermark: "狐",
      imagePath: "image/tamamo.png",
      accentColor: "#4a8ab8",
      stats: {
        talk: 3,
        dance: 1,
        party: 3
      },
      passiveType: "reduce_penalty_on_fail",
      passiveValue: 1,
      traitName: "宴会場の取り成し",
      traitDesc: "おもてなし失敗時、受けるペナルティを1軽減する",
      cooldownTurns: 0,
      quote: "「宴会場を任されている玉藻だよ。ヨモツヘグイで常世に堕ちないよう、あたしがしっかり取り成してあげるからね」"
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
      traitName: "宵闇に響く美声",
      traitDesc: "おもてなし成功時、追加で『雅』+1を回復する",
      cooldownTurns: 0,
      quote: "「歌姫のるちゃです♪ 今宵は私の美声と楽しいお酒で、お座敷の雅な情緒をたっぷり味わっていってくださいね！」"
    },
    // 8. 女中・にゃる
    {
      id: "cast_nyaru",
      name: "にゃる",
      title: "帳場頭女中",
      fullName: "女中・にゃる",
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
      traitName: "狭間の宿の采配",
      traitDesc: "配置したお座敷の得意属性ボーナスを『+3』にする",
      cooldownTurns: 0,
      quote: "「おつかれでしょう？ 現世へ還るその刻まで、この逢曲時でゆっくり魂を休めていってくださいね」"
    }
  ],

  // 来訪者（現世から魂が迷い込んだ客人）カードデータ（全10種類）
  visitors: [
    // 1. 夕霧に迷い込んだ旅人
    {
      id: "vis_traveler",
      name: "夕霧に迷い込んだ旅人",
      category: "臨死の迷い人",
      kanjiWatermark: "迷",
      imagePath: "",
      requirements: [{ stat: "talk", value: 3 }],
      tier: "early",
      difficulty: "易",
      reward: { reputation: 1, spirit: 0 },
      penalty: { reputation: -1, spirit: 0 },
      desc: "旅路の不慮の事故により、何かの拍子に魂が現世から離れて迷い込んだ人間。穏やかな語らいで魂を落ち着かせる必要がある。",
      successFlavor: "親身な語らいに旅人は現世で待つ家族の顔を思い出し、竹林を割く“黄泉平坂”を通って無事に現世へと還っていった。",
      failFlavor: "不安を鎮められず旅人の魂は激しく揺らぎ、常世の深い霧の中へと彷徨い出てしまった……。"
    },
    // 2. 神楽を恋う華族の魂
    {
      id: "vis_dancelover",
      name: "神楽を恋う華族の魂",
      category: "昏睡の貴人",
      kanjiWatermark: "神",
      imagePath: "",
      requirements: [{ stat: "dance", value: 3 }],
      tier: "early",
      difficulty: "普",
      reward: { reputation: 0, spirit: 1 },
      penalty: { reputation: 0, spirit: -1 },
      desc: "重い病の床で魂が常世の狭間へ漂着した貴人。本来は神を鎮める『神楽』の舞によって荒ぶる魂を安定させねばならない。",
      successFlavor: "紅き彼岸花が舞うような神楽の演舞に貴人の魂は浄化され、穏やかな微笑みとともに黄泉平坂より現世へ還った！",
      failFlavor: "舞の乱れにより神楽の霊威が届かず、貴人の魂は現世への道を見失い座敷の空気が凍りついた……。"
    },
    // 3. ヨモツヘグイに惹かれる酔客
    {
      id: "vis_drinker",
      name: "ヨモツヘグイに惹かれる酔客",
      category: "危うき迷い人",
      kanjiWatermark: "酌",
      imagePath: "",
      requirements: [{ stat: "party", value: 3 }],
      tier: "early",
      difficulty: "普",
      reward: { reputation: 1, spirit: 0 },
      penalty: { reputation: 0, spirit: -1 },
      desc: "悪霊に勧められるまま常世の膳に手を伸ばしかけている危うい客人。健全な座興で気を逸らし、ヨモツヘグイを防がねばならない。",
      successFlavor: "粋な音曲と座興で悪霊の誘惑を払い除け、酔客は常世の毒を口にすることなく現世へと送り還された！",
      failFlavor: "目を離した隙に常世の酒食（ヨモツヘグイ）に深く魅入られ、魂が常世の側へと傾いてしまった……。"
    },
    // 4. 生死の境を彷徨う名家の当主
    {
      id: "vis_patron",
      name: "生死の境を彷徨う大旦那",
      category: "大尽の迷い魂",
      kanjiWatermark: "極",
      imagePath: "",
      requirements: [{ stat: "dance", value: 5 }],
      tier: "high",
      difficulty: "難",
      reward: { reputation: 2, spirit: 1 },
      penalty: { reputation: -2, spirit: 0 },
      desc: "強い執着と未練を抱えたまま狭間へ迷い込んだ大旦那。大広間・神楽舞台の地の利を活かした最高峰の【神楽舞】でなければ魂を鎮められない。",
      successFlavor: "「これほど神々しい神楽舞は初めて見たぞ……！」大旦那の未練は綺麗に晴れ、八つ槌車の提灯に一礼して黄泉平坂を登っていった！",
      failFlavor: "「この程度の舞ではわしの未練は断てぬわ！」大旦那の魂が暴走し、逢曲時の評判に大きな傷がついてしまった……！"
    },
    // 5. 現世の記憶を失いかけた青年
    {
      id: "vis_incognito",
      name: "記憶を失いかけた迷い人",
      category: "忘却の迷い魂",
      kanjiWatermark: "憶",
      imagePath: "",
      requirements: [{ stat: "talk", value: 4 }],
      tier: "mid",
      difficulty: "高",
      reward: { reputation: 0, spirit: 2 },
      penalty: { reputation: -1, spirit: 0 },
      desc: "常世の狭間に長く留まりすぎたせいで、自分の名や現世の記憶を忘れかけている人間。高い【話術】で記憶の糸を手繰り寄せる必要がある。",
      successFlavor: "丁寧な語らいの末に「そうだ、僕には帰る場所があるんだ」と涙をこぼし、黄泉平坂の竹林を抜けて現世へ還っていった！",
      failFlavor: "言葉が心に届かず、青年は虚ろな瞳のまま常世の奥深くへと足を向けてしまった……。"
    },
    // 6. 狐面の風流人（複合要求：話術3 かつ 舞踊3）
    {
      id: "vis_foxconnoisseur",
      name: "狭間を覗く狐面の風流人",
      category: "境界の粋人",
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
      desc: "夢と現のあわいから逢曲時へ迷い込んだ風流人。魂を揺さぶる【話術】と神楽の【舞踊】の双方を同時に求めている。",
      successFlavor: "言霊と神楽舞の見事な調和に風流人のヒガン石が紅く輝き、清々しい足取りで現世の朝へと還っていった！",
      failFlavor: "語らいか舞のどちらかが欠け、風流人は「まだ常世の夢から醒められぬな」と肩をすくめた。"
    },
    // 7. 遭難した一行の魂（複合要求：座興3 かつ 話術3）
    {
      id: "vis_merchants",
      name: "夜道で遭難した一行の魂",
      category: "集団の迷い人",
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
      desc: "峠道の事故で一度に魂が迷い込んでしまった一行。パニックを和らげる【話術】と、生気を取り戻させる賑やかな【座興】が同時に試される。",
      successFlavor: "温かな語らいと陽気な座興で全員の魂が安定し、一行は励まし合いながら黄泉平坂を現世へと帰っていった！",
      failFlavor: "一行の動揺を抑えきれず、悪霊たちの誘惑に当てられてお座敷の『雅』が大きく損なわれてしまった……！"
    },
    // 8. 竹林で眠りかけた童子（ラッキー枠）
    {
      id: "vis_child",
      name: "竹林で迷った幼き魂",
      category: "無垢なる迷い子",
      kanjiWatermark: "紅",
      imagePath: "",
      requirements: [{ stat: "talk", value: 2 }],
      tier: "early",
      difficulty: "福",
      reward: { reputation: 1, spirit: 1 },
      penalty: { reputation: 0, spirit: 0 },
      desc: "高熱の夢の中で逢曲時の竹林へ迷い込んだ無垢な童子。触れたヒガン石が彼岸花のように紅く染まる善き魂で、少し語らうだけで宿に福をもたらす。",
      successFlavor: "「お姉ちゃんたち、ありがとう！」童子の無垢な笑顔にヒガン石が美しく紅く輝き、黄泉平坂から無事に現世の母の元へと還った！",
      failFlavor: "童子は眠そうに目をこすりながらも、女将の提灯に守られて静かに現世への坂道を戻っていった（被害なし）。"
    },
    // 9. 悪霊に魅入られかけた通人
    {
      id: "vis_playboy",
      name: "常世の香に酔う遊び人",
      category: "惑いし通人",
      kanjiWatermark: "惑",
      imagePath: "",
      requirements: [{ stat: "party", value: 2 }],
      tier: "early",
      difficulty: "易",
      reward: { reputation: 0, spirit: 1 },
      penalty: { reputation: -1, spirit: 0 },
      desc: "「こんな美酒と美女がいるなら現世へ還らずともよい」と黄泉国へ堕ちかけている遊び人。粋な座興で目を覚まさせる必要がある。",
      successFlavor: "神楽の音曲にハッと正気を取り戻し、「危うく常世に骨を埋めるところだったぜ」と感謝して黄泉平坂へ旅立った。",
      failFlavor: "「もっと常世の酒をくれよ……」とヨモツヘグイの誘惑に溺れかけ、宿の評判を落としてしまった……。"
    },
    // 10. 黄泉平坂を見失った宿縁の客（高難度：座興5）
    {
      id: "vis_regular",
      name: "黄泉平坂を見失った宿縁の客",
      category: "深淵の迷い魂",
      kanjiWatermark: "還",
      imagePath: "",
      requirements: [{ stat: "party", value: 5 }],
      tier: "high",
      difficulty: "極",
      reward: { reputation: 2, spirit: 1 },
      penalty: { reputation: -2, spirit: 0 },
      desc: "幾度も生死の淵を彷徨い、常世の深淵まで堕ちかけた極めて危うい魂。最高峰の【座興5】（宴席＋常世／ならく／にゃる）による魂振りの大神楽で現世へ引き戻せ。",
      successFlavor: "「見えたぞ……竹林を割く黄泉平坂の光が！」宿を挙げた大座興により魂が力強く蘇り、逢曲時に最高の誉れを刻んで現世へ生還した！",
      failFlavor: "「もう現世へ続く坂が見えぬ……」魂を現世へ引き戻す力が足りず、宿の評判が大きく揺らいでしまった！"
    }
  ],

  // おもてなし成功（鎮魂・黄泉平坂送り還し）時のミニ会話カットイン定義
  hospitalityDialogues: {
    // 1. 女将・常世
    cast_tokoyo: {
      defaultCastLine: "「逢曲時の女将、常世でございます。神楽の演舞と語らいにて貴方の魂を鎮め、黄泉平坂より現世へ送り還しましょう」",
      byVisitor: {
        vis_traveler: {
          castLine: "「夜霧の狭間へよくぞ辿り着かれました。八つ槌車の提灯が灯るこの座敷で、まずは乱れた魂をお休めなさいませ」",
          visitorLine: "「ああ、女将さまの声を聞いていると、現世で待つ者たちの顔がはっきりと思い出されます……！」",
          narration: "女将・常世の慈愛に満ちた神楽のもてなしにより、旅人は竹林を割く黄泉平坂から現世へと還っていった。"
        },
        vis_patron: {
          castLine: "「大旦那さま、現世への未練は私の演舞で浄化いたしましょう。――逢曲時秘伝の神楽舞、とくとご覧あれ」",
          visitorLine: "「おおっ、女将直々の神楽舞とは……！ 胸のつかえがすっと溶け、現世へ還る力が湧いてきたぞ！」",
          narration: "常世の圧倒的な演舞に大旦那の魂は完全に安定し、黄泉平坂の竹林へと晴れやかに送り還された！"
        },
        vis_regular: {
          castLine: "「どれほど深く常世へ迷い込もうとも、私が女将である限り黄泉国へは堕としません。さあ、魂振りの大宴を始めましょう」",
          visitorLine: "「常世さまの威光、まさに八つ槌車のごとし！ 閉ざされていた黄泉平坂の道がはっきり見えるぞ！」",
          narration: "逢曲時の主・常世の渾身のもてなしにより、深淵に沈みかけた魂は見事に現世へと生還を果たした！"
        },
        vis_foxconnoisseur: {
          castLine: "「現と幻の狭間を愛でるのも一興なれど、生者の居場所は現世にございます。神楽の舞と言霊を餞（はなむけ）に贈りましょう」",
          visitorLine: "「話術といい演舞といい、さすがは逢曲時の女将。おかげで心地よく現世の朝へ目覚められそうだ」",
          narration: "狐面の風流人は深く一礼し、八つ槌車の提灯に導かれて黄泉平坂を登っていった。"
        },
        vis_merchants: {
          castLine: "「皆さま、慌てずとも大丈夫ですよ。私が直々に座を鎮め、お一人残らず現世への坂道へお送りいたします」",
          visitorLine: "「女将さま自らお出ましくださるとは心強い！ 皆の衆、魂を落ち着けて現世へ還るぞーっ！」",
          narration: "女将の威光と鮮やかな座回しで一行の動揺は鎮まり、揃って無事に現世へと送り還された。"
        },
        vis_incognito: {
          castLine: "「お名前を忘れかけても案ずることはありません。八つ槌車の灯火が、貴方の現世への縁を照らしておりますよ」",
          visitorLine: "「不思議だ……常世さまと語らううちに、自分の名前も大切な人の声もすべて蘇ってきました！」",
          narration: "常世の静かな言霊が忘却の霧を払い、迷い人は涙を拭って黄泉平坂へと踏み出した。"
        }
      }
    },

    // 2. 芸者・ハルカ
    cast_haruka: {
      defaultCastLine: "「外から見てたよ～呼んでみて～！ 芸者ハルカの神楽舞で、迷い込んだ魂を綺麗に鎮めてあげるね！」",
      byVisitor: {
        vis_dancelover: {
          castLine: "「貴人さま、彼岸花の紅き輝きを映した神楽『恋慕の扇舞』をご覧にいれます。どうぞ魂を委ねてくださいませ」",
          visitorLine: "「なんと凛として神々しい舞姿か……！ 荒ぶっていた魂がすっと静まり、現世の光が見えてきたぞ！」",
          narration: "ハルカの神楽舞が貴人の魂を安定させ、店外の竹林を割く黄泉平坂へと導いた。"
        },
        vis_patron: {
          castLine: "「大旦那さまの深い未練も、この大広間の檜舞台で舞い鎮めてみせましょう！ いざ、神楽『月下千鶴の舞』！」",
          visitorLine: "「天晴れじゃハルカ殿！ これほど魂に響く神楽を見せてもらっては、現世へ還らぬわけにはいかんな！」",
          narration: "舞台と一体になった至高の神楽舞により、大旦那の魂は力強く現世へと送り還された！"
        },
        vis_playboy: {
          castLine: "「常世の闇に目を奪われちゃダメだよ！ ほら、私の扇さばきと座興を見てしっかり正気を取り戻して！」",
          visitorLine: "「へえ、ハルカちゃんの鮮やかな舞を見たら、ヨモツヘグイの酔いも一気に醒めたよ。ありがとう！」",
          narration: "華やかなハルカの神楽舞に、遊び人は晴れやかな顔で現世へと帰っていった。"
        }
      }
    },

    // 3. 女中・ならく
    cast_naraku: {
      defaultCastLine: "「獄門の鬼、ならくじゃ。酒の肴はヒトの魂……なれど今宵は女将の言いつけ通り、賑やかな座興で送り還してやろう！」",
      byVisitor: {
        vis_drinker: {
          castLine: "「おっと客人、悪霊どものヨモツヘグイに手を出してはならんぞ！ わしが魂振りの祝酒を酌んでやろう、さあグイッと！」",
          visitorLine: "「くぅーっ、獄門の鬼が酌む酒は魂の底から熱くなる！ おかげで常世の毒に呑まれずに済んだわい！」",
          narration: "ならくの豪快な座興により、酔客は悪霊の誘惑を振り切って現世へ還った。"
        },
        vis_merchants: {
          castLine: "「迷い込んだ一行よ、怯えていては奈落の底へ堕ちるだけぞ！ さあ手拍子を打て、魂を奮い立たせる大宴会じゃ！」",
          visitorLine: "「ガハハハ！ ならく殿の豪快な座回しで恐怖が吹き飛んだぞ！ 皆で黄泉平坂を登り切るぞーっ！」",
          narration: "座興と話術を駆使したならくの采配で、遭難した一行の魂は活力を取り戻し現世へ生還した！"
        },
        vis_playboy: {
          castLine: "「くふふ、本当に奈落の底へご案内してほしいのか？ ……冗談じゃ、今宵は座敷遊びで魂を揺り起こしてやろう！」",
          visitorLine: "「おっと、本物の獄門鬼に睨まれちゃ敵わないね！ 最高の座興だったぜ、現世へ帰るとするよ！」",
          narration: "鬼女中ならではの迫力と粋な遊びに、遊び人はすっかり目を覚まして黄泉平坂へ向かった。"
        },
        vis_regular: {
          castLine: "「深淵まで堕ちかけた魂よ、我が獄門の気迫と月見の宴で現世まで一気に蹴り上げてやろうぞ！」",
          visitorLine: "「見事じゃならく！ お主の凄まじい座興のおかげで、消えかけていた黄泉平坂の道が再び開かれたわ！」",
          narration: "彼岸月見の宴席を極限まで沸かせたならくの力が、宿縁の客を現世へと救い上げた！"
        }
      }
    },

    // 4. 女中・まりん
    cast_marin: {
      defaultCastLine: "「猫のイザナミ、まりんです！ 楽しいお喋りで、お客さまの魂を現世へ繋ぎ止めてみせますね！」",
      byVisitor: {
        vis_traveler: {
          castLine: "「旅のお客さま、狭間の夜道は心細かったでしょう？ 此岸（現世）での思い出話、わたしにたくさん聞かせてくださいっ！」",
          visitorLine: "「まりんちゃんが目を輝かせて聞いてくれるおかげで、自分が現世で生きていた実感がはっきり戻ってきたよ」",
          narration: "まりんの温かな話術に導かれ、旅人は黄泉平坂から現世へと還っていった。"
        },
        vis_incognito: {
          castLine: "「お名前が思い出せなくても大丈夫！ 好きな食べ物でも季節の景色でも、わたしと一緒に少しずつお話ししましょう♪」",
          visitorLine: "「あ……そうだ、僕は春の桜を見るために生きていたんだ。ありがとうまりんちゃん、現世へ帰れるよ！」",
          narration: "猫の誘魅の一生懸命な語らいが忘却の呪縛を解き、座敷に清らかな雅が満ち溢れた！"
        },
        vis_child: {
          castLine: "「わあ、小さな迷い子さん！ 怖くないよ、猫のイザナミのお姉ちゃんと楽しい昔話をしようね！」",
          visitorLine: "「わあーい！ まりんお姉ちゃんのお耳ふわふわ！ わたし、おうちのママのところへ帰るね！」",
          narration: "二人の弾むような笑い声がお座敷に響き、宿に温かな福運が舞い込んだ。"
        },
        vis_merchants: {
          castLine: "「皆さま、パニックにならずに一人ずつ順番にお話を聞かせてくださいっ！ わたしがしっかり受け止めますから！」",
          visitorLine: "「おう、まりんちゃんの明るい声を聞いたら落ち着いてきたぞ！ みんなで現世へ帰ろう！」",
          narration: "まりんの天性の愛嬌とトーク力が一座の魂を繋ぎ止め、一行は無事に黄泉平坂へと旅立った。"
        }
      }
    },

    // 5. 女中・月下香
    cast_gekkakou: {
      defaultCastLine: "「逢曲時に棲む『強キ鬼』、月下香でございます。逝きは宵々、還りは──華やかな神楽でお見送りいたしましょう」",
      byVisitor: {
        vis_traveler: {
          castLine: "「夜露に凍えた魂には、香り高い花茶と語らいを。……まだ常世へ堕ちる時ではございませんよ」",
          visitorLine: "「強キ鬼と聞いて震えていましたが、なんと気高く優しいお方か……！ ご恩は現世へ還っても忘れません！」",
          narration: "月下香の凛としたもてなしに旅人の魂は鎮まり、逢曲時の高い評判が狭間の世に響き渡った。"
        },
        vis_dancelover: {
          castLine: "「貴人さま、今宵は月下美人の香りを纏わせた扇にて、魂鎮めの神楽舞を披露いたしますわ」",
          visitorLine: "「おお、舞うたびに芳しい香りと霊力が満ちていく……！ まさに魂が洗われるような名演じゃ！」",
          narration: "強キ鬼・月下香の艶やかな神楽舞により、貴人は晴れやかに黄泉平坂より現世へ還った。"
        },
        vis_foxconnoisseur: {
          castLine: "「逝きは宵々、還りは黄泉平坂──。語らいも神楽舞も、この月下香が極上の夢として仕立ててみせましょう」",
          visitorLine: "「話術よし、舞姿よし！ 逢曲時に月下香ありと讃えられる理由がようく分かったぞ！」",
          narration: "複合要求を優雅にこなした月下香の手腕により、宿の評判はかつてないほど高まった！"
        },
        vis_incognito: {
          castLine: "「現世の記憶を失いかけても、貴方の魂の香りは消えておりません。さあ、私の声を手がかりにお還りなさいませ」",
          visitorLine: "「月下香さんの凛とした言葉に、魂の輪郭が戻ってきました。本当にありがとう……」",
          narration: "月下香の洗練された言霊に導かれ、迷い人は確かな足取りで竹林の坂道を登っていった。"
        }
      }
    },

    // 6. 女中・玉藻
    cast_tamamo: {
      defaultCastLine: "「蒼い九尾の玉藻だよ。本当は黄泉に引き留めたいところだけど……今夜は宴会場の責任者として現世へ送り還してあげる！」",
      byVisitor: {
        vis_drinker: {
          castLine: "「ほらほらお客さん、悪霊が勧めるヨモツヘグイに手を出しちゃダメだってば！ あたしの酌で正気を保ちなよ！」",
          visitorLine: "「わっはっは！ 九尾の玉藻ちゃんに叱られちゃあ仕方ないな！ おかげで常世に堕ちずに済んだよ！」",
          narration: "蒼い九尾・玉藻の面倒見の良い取り成しで、酔客はヨモツヘグイを免れ現世へと送り還された。"
        },
        vis_merchants: {
          castLine: "「宴会場を任されてるあたしに任せな！ 胃が痛くなるような騒ぎも、三味線とトークでピシッと鎮めてみせるよ！」",
          visitorLine: "「おおーっ、玉藻さんが仕切ってくれると座敷が一気に引き締まるな！ よし、皆で現世へ帰るぞ！」",
          narration: "玉藻の巧みな座興と話術で一行の魂は安定し、竹林を割く黄泉平坂へと送り出された！"
        },
        vis_playboy: {
          castLine: "「現世に戻れないなら私のそばに置くけど……あんたはまだ還れる魂だね。ほら、狐拳で一勝負して目を覚ましな！」",
          visitorLine: "「ゾッとするほど妖艶なのに面倒見がいいんだから！ 玉藻ちゃんのおかげで現世へ帰る気になったぜ」",
          narration: "九尾の妖狐の危うい魅力と粋な計らいに、遊び人は深く感謝して現世へと帰っていった。"
        }
      }
    },

    // 7. 歌姫・るちゃ
    cast_rucha: {
      defaultCastLine: "「歌姫のるちゃです♪ 美しい調べと舞、そして賑やかな音曲でお座敷に雅な風を吹かせましょう！」",
      byVisitor: {
        vis_dancelover: {
          castLine: "「貴人さま、今宵は私の唄声に合わせて舞う『宵待草の神楽舞』をお楽しみくださいませ♪」",
          visitorLine: "「澄み渡る歌声に優美な舞が重なるとは……なんと贅沢で雅やかな舞台であろうか！」",
          narration: "歌姫・るちゃの響き渡る歌声と舞によりお座敷は華やぎ、格別な『雅』が満ち溢れた。"
        },
        vis_drinker: {
          castLine: "「美味しいお酒には良い唄がつきものですね♪ 私の歌声を肴に、今宵の宴を心ゆくまで楽しんでいってくださいな！」",
          visitorLine: "「いやあ、るちゃちゃんの美声を聴きながら飲む酒はこの世の極楽じゃ！ おかげで現世へ還る活力が湧いてきたぞ！」",
          narration: "鬼の歌姫が奏でる華やかな音色により宴席は大いに盛り上がり、宿の雅がいっそう深まった。"
        },
        vis_playboy: {
          castLine: "「通なお客さまには、とっておきの艶唄と座興でお相手いたしましょう♪ さあ、手拍子をどうぞ！」",
          visitorLine: "「いいねえ、その艶のある節回し！ るちゃちゃんの歌声に酔いしれて、すっかり心が満たされたよ！」",
          narration: "るちゃの圧倒的な歌唱力に魅了され、遊び人は満足げな笑顔で黄泉平坂を登っていった。"
        }
      }
    },

    // 8. 女中・にゃる
    cast_nyaru: {
      defaultCastLine: "「おつかれでしょう？ 帳場頭のにゃるです。各座敷の霊力を最大限に活かし、黄泉平坂まで安全にお送りしますね」",
      byVisitor: {
        vis_patron: {
          castLine: "「大旦那さま、八つ槌車の提灯と神楽舞台の設えはすべて整っております。宿の総力を挙げた鎮魂の舞をご覧あれ！」",
          visitorLine: "「ぬおおっ！？ 広間全体の提灯と襖が神楽に共鳴しておる！ にゃる殿の采配、見事なり！」",
          narration: "にゃるが大広間・神楽舞台の霊力を極限（+3）まで引き出し、大旦那の魂を完全に鎮めて現世へ送り還した！"
        },
        vis_incognito: {
          castLine: "「この離れ座敷からは現世へ続く竹林の坂『黄泉平坂』がすぐそこに見えます。ここでゆっくり記憶を取り戻してくださいね」",
          visitorLine: "「本当だ……竹林の向こうに現世の風が吹いている。にゃるさんの細やかな気遣いに救われました」",
          narration: "離れ座敷の特性を最大限に活かした接客で、迷い人は記憶を取り戻し無事に現世へ還った！"
        },
        vis_regular: {
          castLine: "「深淵の迷い人さま、今宵は月見の宴席に八つ槌車の百提灯を灯し、逢曲時最大の神楽宴をご用意いたしました！」",
          visitorLine: "「これほど温かく力強いおもてなしは初めてだ……！ にゃる殿、おかげで現世へ還れるぞ！」",
          narration: "宴席のボーナスを極限（+3）まで高めたにゃるの采配により、最も困難な魂の送り還しが成就した！"
        },
        vis_foxconnoisseur: {
          castLine: "「おつかれでしょう？ 語らいも神楽舞も一番心地よく響くよう、座敷の空気を整えておきましたよ」",
          visitorLine: "「うむ、座敷全体のしつらえからして一級品じゃな。見事な鎮魂のおもてなしに感服したぞ」",
          narration: "にゃるの行き届いた采配に風流人も深く頷き、逢曲時の名声がさらに高まった。"
        }
      }
    }
  },

  // 公式世界観（https://oumagatoki.pages.dev/world）辞典データ（ゲーム内モーダル表示用）
  worldLore: [
    {
      title: "彼岸旅館「逢曲時」おうまがとき",
      subtitle: "現世と常世の狭間にある死者の店",
      body: "様々な時代の死者達が女中として集う場所。死者の種族は人間だけに留まらず、妖狐や鬼等、アヤカシの類も居る。<br>彼女達の目的は、何かの拍子に魂が現世から離れて迷い込んでしまった人間達を接客や芸でもてなし、彼等を現世へ送り還す事。退店時は店外入口から竹林を割く様に現世へ続く坂<strong>“黄泉平坂（よもつひらさか）”</strong>から送り還す。<br>ただし、死者の中には勿論悪霊も居り、客人に対し飲食を強く勧め、<strong>ヨモツヘグイ（黄泉戸喫）</strong>により常世へ堕とそうとする。"
    },
    {
      title: "ヒガン石（ひがんせき）",
      subtitle: "誘魅達が身に付けている宝石の名称",
      body: "触れた者の魂の本質を見抜く性質があり、元々は無色透明な石だが、魂が<strong>「善」</strong>に近い者が触れると、彼岸花の様に<strong>紅く染まり</strong>、魂が<strong>「悪」</strong>に近い者が触れると、根の毒の様に<strong>黒く染まる</strong>。"
    },
    {
      title: "誘魅（いざなみ）",
      subtitle: "正式名称：「誘魅巫女（いざなみのみこ）」",
      body: "国産みの神であるイザナミノミコトの名を冠した霊的存在であり、事故や病気により生きたまま常世へ迷い込んでしまった人間達の魂に対し、本来は神を鎮める為に行われる<strong>神楽（かぐら）</strong>を用いて魂を安定させ、人間達を現世へ送り返している。<br>彼女達が逢曲時で行っている接客や舞、武芸、演奏には神楽の意味合いがある。一見人間達に優しい善霊の様に見えるが、実際の所、誘魅となった霊の多くは生前に大罪を犯して処刑されたり、非業の死を遂げて遺恨を孕みながら地獄へ堕ちた人間や妖怪が贖罪の為に変化した者達であり、中にはその名の通り、人間達を魅了して黄泉国へ誘い、堕とそうとする悪霊も居る。"
    },
    {
      title: "八つ槌車（やつづちぐるま）",
      subtitle: "女将・常世の生前の家の家紋",
      body: "常世さんの生前の家の家紋。提灯等ところどころに使われている。<br>平安貴族の乗り物である牛車の車輪と、木製の槌（打ち出の小槌）をモチーフにした歴史ある紋。「打ち出の小槌」の縁起の良さや、「敵を討つ」という意味から武家にも用いられた。幸運を呼ぶ、商売繁盛の意味もある。"
    }
  ]
};
