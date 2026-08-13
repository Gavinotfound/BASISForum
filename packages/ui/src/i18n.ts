export const locales = ['en', 'zh-CN', 'fr', 'is'] as const;
export type Locale = (typeof locales)[number];

export const languageLabels: Record<Locale, string> = {
  en: 'English',
  'zh-CN': '简体中文',
  fr: 'Français',
  is: 'Íslenska',
};

type Messages = Record<string, string>;

const en: Messages = {
  'nav.search': 'Search', 'nav.saved': 'Saved', 'nav.updates': 'Updates', 'nav.profile': 'Profile', 'nav.newPost': 'New Post', 'nav.signOut': 'Sign out', 'nav.signIn': 'Sign in', 'nav.language': 'Language',
  'loading.default': 'Loading your study space…',
  'hero.badge': 'Your study network is live', 'hero.title': 'Make the next breakthrough, {name}.', 'hero.body': 'Trade explanations, solve hard problems, and turn study sessions into momentum across every subject.', 'hero.cta': 'Start a discussion',
  'feed.explore': 'Explore', 'feed.latestHeading': 'Fresh from the study floor', 'feed.hotHeading': 'The room is heating up', 'feed.latestBody': 'New questions, explanations, and study wins.', 'feed.hotBody': 'Ranked by community heat: upvotes minus downvotes.', 'feed.latest': 'Latest', 'feed.hot': 'Hot', 'feed.emptyTitle': 'The floor is waiting for the first idea.', 'feed.emptyBody': 'Start a conversation and set the tone for your study crew.',
  'thread.by': 'by {author}', 'thread.reply': 'reply', 'thread.replies': 'replies', 'thread.join': 'Join the conversation', 'thread.heat': 'heat',
  'stats.eyebrow': 'Community pulse', 'stats.title': 'Built by students,\nfor students.', 'stats.students': 'Students collaborating', 'stats.notes': 'Notes shared', 'stats.groups': 'Active study groups',
  'auth.welcome': 'Welcome Back!', 'auth.emailOrUsername': 'Email or username', 'auth.emailPlaceholder': 'e.g. test@example.com or test', 'auth.password': 'Password', 'auth.signingIn': 'Signing in…', 'auth.forgot': 'Forgot Password?', 'auth.join': 'Join the Study Hub!', 'auth.fullName': 'Full Name', 'auth.email': 'Email', 'auth.create': 'Create Account', 'auth.creating': 'Creating account…',
  'form.newDiscussion': 'Start a New Discussion', 'form.newDiscussionBody': 'Ask a focused question, share your reasoning, and help classmates learn together.', 'form.subject': 'Subject', 'form.title': 'Title', 'form.titlePlaceholder': 'Example: How do I solve this related-rates question?', 'form.titleHelp': 'Use a specific title so classmates can find your discussion.', 'form.details': 'Details', 'form.detailsPlaceholder': 'Include what you have tried, the exact question, and where you got stuck…', 'form.detailsHelp': 'Avoid sharing personal information. You can edit your question later from the thread page.', 'form.publishing': 'Publishing…', 'form.publish': 'Publish discussion', 'form.visibility': 'Your post will be visible to the BasisForum community.', 'form.reply': 'Reply',
  'admin.overview': 'Overview', 'admin.reports': 'Reports', 'admin.students': 'Students', 'admin.settings': 'Settings', 'admin.desk': 'MODERATION DESK', 'admin.safety': 'Community safety', 'admin.center': 'Moderation command center', 'admin.description': 'Review reports, protect study spaces, and keep the conversation useful.', 'admin.waiting': 'waiting', 'admin.resolved': 'resolved', 'admin.queueClear': 'The queue is clear.', 'admin.noReports': 'No reports are waiting for review right now.', 'admin.target': 'TARGET', 'admin.reporter': 'REPORTER', 'admin.reason': 'REASON', 'admin.status': 'STATUS', 'admin.action': 'ACTION', 'admin.dismiss': 'Dismiss', 'admin.takeAction': 'Take action', 'admin.resolvedLabel': 'Resolved',
};

const zh: Messages = {
  'nav.search': '搜索', 'nav.saved': '收藏', 'nav.updates': '动态', 'nav.profile': '个人资料', 'nav.newPost': '发新帖', 'nav.signOut': '退出登录', 'nav.signIn': '登录', 'nav.language': '语言',
  'loading.default': '正在加载学习空间…',
  'hero.badge': '你的学习网络已上线', 'hero.title': '开启下一次突破，{name}。', 'hero.body': '交流解题思路，攻克难题，让每个学科的学习更有动力。', 'hero.cta': '开始讨论',
  'feed.explore': '探索', 'feed.latestHeading': '来自学习讨论区的新内容', 'feed.hotHeading': '正在升温的讨论', 'feed.latestBody': '新的问题、解答和学习成果。', 'feed.hotBody': '按社区热度排序：赞成票减去反对票。', 'feed.latest': '最新', 'feed.hot': '热门', 'feed.emptyTitle': '讨论区正在等待第一个想法。', 'feed.emptyBody': '发起一场讨论，为学习小组定下基调。',
  'thread.by': '作者：{author}', 'thread.reply': '条回复', 'thread.replies': '条回复', 'thread.join': '加入讨论', 'thread.heat': '热度',
  'stats.eyebrow': '社区脉搏', 'stats.title': '由学生打造，\n服务学生。', 'stats.students': '位学生正在协作', 'stats.notes': '份笔记已分享', 'stats.groups': '个活跃学习小组',
  'auth.welcome': '欢迎回来！', 'auth.emailOrUsername': '邮箱或用户名', 'auth.emailPlaceholder': '例如：test@example.com 或 test', 'auth.password': '密码', 'auth.signingIn': '正在登录…', 'auth.forgot': '忘记密码？', 'auth.join': '加入学习中心！', 'auth.fullName': '姓名', 'auth.email': '邮箱', 'auth.create': '创建账户', 'auth.creating': '正在创建账户…',
  'form.newDiscussion': '发起新讨论', 'form.newDiscussionBody': '提出明确的问题，分享你的思路，并帮助同学共同学习。', 'form.subject': '学科', 'form.title': '标题', 'form.titlePlaceholder': '例如：如何解决这道相关变化率问题？', 'form.titleHelp': '使用具体标题，方便同学找到你的讨论。', 'form.details': '详情', 'form.detailsPlaceholder': '写下你已经尝试的内容、具体问题和卡住的地方…', 'form.detailsHelp': '请勿分享个人信息。之后可在帖子页面编辑问题。', 'form.publishing': '正在发布…', 'form.publish': '发布讨论', 'form.visibility': '你的帖子将对 BasisForum 社区可见。', 'form.reply': '回复',
  'admin.overview': '概览', 'admin.reports': '举报', 'admin.students': '学生', 'admin.settings': '设置', 'admin.desk': '审核工作台', 'admin.safety': '社区安全', 'admin.center': '审核指挥中心', 'admin.description': '审核举报，保护学习空间，让讨论保持有用。', 'admin.waiting': '待处理', 'admin.resolved': '已处理', 'admin.queueClear': '队列已清空。', 'admin.noReports': '当前没有待处理的举报。', 'admin.target': '目标', 'admin.reporter': '举报人', 'admin.reason': '原因', 'admin.status': '状态', 'admin.action': '操作', 'admin.dismiss': '忽略', 'admin.takeAction': '执行处理', 'admin.resolvedLabel': '已解决',
};

const fr: Messages = {
  'nav.search': 'Rechercher', 'nav.saved': 'Enregistrés', 'nav.updates': 'Actualités', 'nav.profile': 'Profil', 'nav.newPost': 'Nouveau post', 'nav.signOut': 'Se déconnecter', 'nav.signIn': 'Se connecter', 'nav.language': 'Langue',
  'loading.default': 'Chargement de votre espace d’étude…',
  'hero.badge': 'Votre réseau d’étude est en ligne', 'hero.title': 'Faites votre prochaine percée, {name}.', 'hero.body': 'Échangez des explications, résolvez des problèmes difficiles et donnez de l’élan à vos études dans chaque matière.', 'hero.cta': 'Lancer une discussion',
  'feed.explore': 'Explorer', 'feed.latestHeading': 'Nouveautés de l’espace d’étude', 'feed.hotHeading': 'La discussion monte en température', 'feed.latestBody': 'Nouvelles questions, explications et réussites.', 'feed.hotBody': 'Classé par énergie communautaire : votes positifs moins négatifs.', 'feed.latest': 'Récent', 'feed.hot': 'Populaire', 'feed.emptyTitle': 'L’espace attend sa première idée.', 'feed.emptyBody': 'Lancez une conversation et donnez le ton à votre équipe d’étude.',
  'thread.by': 'par {author}', 'thread.reply': 'réponse', 'thread.replies': 'réponses', 'thread.join': 'Rejoindre la discussion', 'thread.heat': 'score',
  'stats.eyebrow': 'Pouls de la communauté', 'stats.title': 'Créé par les élèves,\npour les élèves.', 'stats.students': 'Élèves qui collaborent', 'stats.notes': 'Notes partagées', 'stats.groups': 'Groupes d’étude actifs',
  'auth.welcome': 'Bon retour !', 'auth.emailOrUsername': 'E-mail ou nom d’utilisateur', 'auth.emailPlaceholder': 'ex. test@example.com ou test', 'auth.password': 'Mot de passe', 'auth.signingIn': 'Connexion…', 'auth.forgot': 'Mot de passe oublié ?', 'auth.join': 'Rejoignez le centre d’étude !', 'auth.fullName': 'Nom complet', 'auth.email': 'E-mail', 'auth.create': 'Créer un compte', 'auth.creating': 'Création du compte…',
  'form.newDiscussion': 'Lancer une discussion', 'form.newDiscussionBody': 'Posez une question précise, partagez votre raisonnement et aidez vos camarades.', 'form.subject': 'Matière', 'form.title': 'Titre', 'form.titlePlaceholder': 'Exemple : Comment résoudre ce problème de taux liés ?', 'form.titleHelp': 'Utilisez un titre précis pour que les autres trouvent votre discussion.', 'form.details': 'Détails', 'form.detailsPlaceholder': 'Indiquez ce que vous avez essayé, la question exacte et ce qui vous bloque…', 'form.detailsHelp': 'Évitez de partager des informations personnelles. Vous pourrez modifier votre question plus tard.', 'form.publishing': 'Publication…', 'form.publish': 'Publier la discussion', 'form.visibility': 'Votre post sera visible par la communauté BasisForum.', 'form.reply': 'Répondre',
  'admin.overview': 'Aperçu', 'admin.reports': 'Signalements', 'admin.students': 'Élèves', 'admin.settings': 'Paramètres', 'admin.desk': 'BUREAU DE MODÉRATION', 'admin.safety': 'Sécurité communautaire', 'admin.center': 'Centre de modération', 'admin.description': 'Examinez les signalements, protégez les espaces d’étude et gardez les échanges utiles.', 'admin.waiting': 'en attente', 'admin.resolved': 'résolus', 'admin.queueClear': 'La file est vide.', 'admin.noReports': 'Aucun signalement n’attend actuellement.', 'admin.target': 'CIBLE', 'admin.reporter': 'SIGNALEUR', 'admin.reason': 'MOTIF', 'admin.status': 'STATUT', 'admin.action': 'ACTION', 'admin.dismiss': 'Ignorer', 'admin.takeAction': 'Agir', 'admin.resolvedLabel': 'Résolu',
};

const is: Messages = {
  'nav.search': 'Leita', 'nav.saved': 'Vistað', 'nav.updates': 'Uppfærslur', 'nav.profile': 'Prófíll', 'nav.newPost': 'Ný færsla', 'nav.signOut': 'Skrá út', 'nav.signIn': 'Skrá inn', 'nav.language': 'Tungumál',
  'loading.default': 'Hleð námsrýminu þínu…',
  'hero.badge': 'Námsnetið þitt er komið í loftið', 'hero.title': 'Taktu næsta stökk, {name}.', 'hero.body': 'Deildu skýringum, leystu erfið verkefni og byggðu upp námsforskot í hverri grein.', 'hero.cta': 'Hefja umræðu',
  'feed.explore': 'Kanna', 'feed.latestHeading': 'Nýtt úr námsrýminu', 'feed.hotHeading': 'Umræðan hitnar', 'feed.latestBody': 'Nýjar spurningar, skýringar og námsárangur.', 'feed.hotBody': 'Raðað eftir samfélagshita: uppatkvæði mínus niðuratkvæði.', 'feed.latest': 'Nýjast', 'feed.hot': 'Heitt', 'feed.emptyTitle': 'Rýmið bíður eftir fyrstu hugmyndinni.', 'feed.emptyBody': 'Byrjaðu samtal og settu tóninn fyrir námshópinn þinn.',
  'thread.by': 'eftir {author}', 'thread.reply': 'svar', 'thread.replies': 'svör', 'thread.join': 'Taktu þátt í umræðunni', 'thread.heat': 'stig',
  'stats.eyebrow': 'Púls samfélagsins', 'stats.title': 'Byggt af nemendum,\nfyri nemendur.', 'stats.students': 'Nemendur í samstarfi', 'stats.notes': 'Glósur deildar', 'stats.groups': 'Virkir námshópar',
  'auth.welcome': 'Velkomin aftur!', 'auth.emailOrUsername': 'Netfang eða notandanafn', 'auth.emailPlaceholder': 't.d. test@example.com eða test', 'auth.password': 'Lykilorð', 'auth.signingIn': 'Skrái inn…', 'auth.forgot': 'Gleymt lykilorð?', 'auth.join': 'Komdu í námsmiðstöðina!', 'auth.fullName': 'Fullt nafn', 'auth.email': 'Netfang', 'auth.create': 'Búa til aðgang', 'auth.creating': 'Bý til aðgang…',
  'form.newDiscussion': 'Hefja nýja umræðu', 'form.newDiscussionBody': 'Spyrðu skýrrar spurningar, deildu röksemdafærslu þinni og hjálpaðu bekkjarfélögum.', 'form.subject': 'Fag', 'form.title': 'Titill', 'form.titlePlaceholder': 'Dæmi: Hvernig leysi ég þetta tengda-hraða dæmi?', 'form.titleHelp': 'Notaðu nákvæman titil svo aðrir finni umræðuna.', 'form.details': 'Nánar', 'form.detailsPlaceholder': 'Lýstu því sem þú hefur prófað, nákvæmri spurningu og hvar þú festist…', 'form.detailsHelp': 'Forðastu persónuupplýsingar. Þú getur breytt spurningunni síðar.', 'form.publishing': 'Bý til…', 'form.publish': 'Birta umræðu', 'form.visibility': 'Færslan verður sýnileg BasisForum-samfélaginu.', 'form.reply': 'Svara',
  'admin.overview': 'Yfirlit', 'admin.reports': 'Tilkynningar', 'admin.students': 'Nemendur', 'admin.settings': 'Stillingar', 'admin.desk': 'STJÓRNUNARBORÐ', 'admin.safety': 'Öryggi samfélagsins', 'admin.center': 'Stjórnunarstöð', 'admin.description': 'Farðu yfir tilkynningar, verndaðu námsrými og haltu umræðum gagnlegum.', 'admin.waiting': 'bíða', 'admin.resolved': 'afgreidd', 'admin.queueClear': 'Biðröðin er tóm.', 'admin.noReports': 'Engar tilkynningar bíða núna.', 'admin.target': 'MARKMIÐ', 'admin.reporter': 'TILKYNNT AF', 'admin.reason': 'ÁSTÆÐA', 'admin.status': 'STAÐA', 'admin.action': 'AÐGERÐ', 'admin.dismiss': 'Hunsa', 'admin.takeAction': 'Grípa til aðgerða', 'admin.resolvedLabel': 'Afgreitt',
};

Object.assign(en, {
  'discussion.replyTo': 'Reply to #{floor}', 'discussion.justNow': 'Just now', 'discussion.reply': 'Reply', 'discussion.add': 'Add to the thread', 'discussion.replying': 'Replying to {target}', 'discussion.join': 'Join the discussion', 'discussion.selectedHelp': 'Your reply will appear beneath the selected floor.', 'discussion.directHelp': 'Reply directly to {author}’s discussion or choose Reply on a specific floor.', 'discussion.placeholder': 'Share your explanation, question, or helpful resource…', 'discussion.replyPlaceholder': 'Write a reply to {target}…', 'discussion.posting': 'Posting…', 'discussion.postReply': 'Post reply', 'discussion.replyToThread': 'Reply to thread instead', 'discussion.signIn': 'Please sign in to join the discussion.', 'discussion.floors': 'Discussion floors', 'discussion.none': 'No replies yet. Be the first to add a floor.',
});
Object.assign(zh, {
  'discussion.replyTo': '回复 #{floor}', 'discussion.justNow': '刚刚', 'discussion.reply': '回复', 'discussion.add': '参与讨论', 'discussion.replying': '正在回复 {target}', 'discussion.join': '加入讨论', 'discussion.selectedHelp': '你的回复将显示在所选楼层下方。', 'discussion.directHelp': '直接回复 {author} 的讨论，或选择特定楼层进行回复。', 'discussion.placeholder': '分享你的解答、问题或有用资源…', 'discussion.replyPlaceholder': '回复 {target}…', 'discussion.posting': '正在发布…', 'discussion.postReply': '发布回复', 'discussion.replyToThread': '改为回复主题', 'discussion.signIn': '请登录后加入讨论。', 'discussion.floors': '讨论楼层', 'discussion.none': '暂时没有回复。成为第一个发言的人吧。',
});
Object.assign(fr, {
  'discussion.replyTo': 'Réponse à #{floor}', 'discussion.justNow': 'À l’instant', 'discussion.reply': 'Répondre', 'discussion.add': 'Ajouter à la discussion', 'discussion.replying': 'Réponse à {target}', 'discussion.join': 'Rejoindre la discussion', 'discussion.selectedHelp': 'Votre réponse apparaîtra sous l’étage sélectionné.', 'discussion.directHelp': 'Répondez directement à la discussion de {author} ou choisissez un étage précis.', 'discussion.placeholder': 'Partagez votre explication, question ou ressource utile…', 'discussion.replyPlaceholder': 'Écrire une réponse à {target}…', 'discussion.posting': 'Publication…', 'discussion.postReply': 'Publier la réponse', 'discussion.replyToThread': 'Répondre au fil à la place', 'discussion.signIn': 'Connectez-vous pour participer à la discussion.', 'discussion.floors': 'Étages de discussion', 'discussion.none': 'Pas encore de réponse. Soyez le premier à ajouter un étage.',
});
Object.assign(is, {
  'discussion.replyTo': 'Svara #{floor}', 'discussion.justNow': 'Rétt í þessu', 'discussion.reply': 'Svara', 'discussion.add': 'Bæta við umræðu', 'discussion.replying': 'Svarar {target}', 'discussion.join': 'Taktu þátt í umræðunni', 'discussion.selectedHelp': 'Svarið þitt birtist undir völdu svari.', 'discussion.directHelp': 'Svaraðu beint umræðu {author} eða veldu ákveðna hæð.', 'discussion.placeholder': 'Deildu skýringu, spurningu eða gagnlegu efni…', 'discussion.replyPlaceholder': 'Skrifa svar við {target}…', 'discussion.posting': 'Bý til…', 'discussion.postReply': 'Birta svar', 'discussion.replyToThread': 'Svara umræðunni í staðinn', 'discussion.signIn': 'Skráðu þig inn til að taka þátt í umræðunni.', 'discussion.floors': 'Umræðuhæðir', 'discussion.none': 'Engin svör enn. Vertu fyrst/ur til að bæta við hæð.',
});

export const messages: Record<Locale, Messages> = { en, 'zh-CN': zh, fr, is };

export const isLocale = (value: string | undefined | null): value is Locale => Boolean(value && locales.includes(value as Locale));

export const translate = (locale: Locale, key: string, vars: Record<string, string | number> = {}) => {
  let text = messages[locale]?.[key] ?? messages.en[key] ?? key;
  for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value));
  return text;
};
