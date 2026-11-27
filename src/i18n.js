/**
 * BioAdapt Localization (English & Arabic)
 * Supports natural Arabic translations and RTL layout.
 */

export const TRANSLATIONS = {
  en: {
    appName: 'Study Pulse: BioAdapt',
    tagline: 'Personal Mental Fatigue & Stress Tracker',
    prototypeNotice: 'Research Prototype • Not a Medical Device • Does Not Diagnose',
    medicalEmergencyNotice: 'If you feel unwell (chest pain, dizziness, trouble breathing), stop and seek medical help immediately.',
    
    // Status & States
    states: {
      calm: {
        title: "You're calm",
        message: 'Your physiological markers are steady and close to your baseline.',
        steps: ['Keep going with your work or study.', 'Great time to record or refine your baseline if feeling rested.']
      },
      medium: {
        title: 'Mild stress',
        message: 'Elevated stress indicators detected compared to baseline.',
        steps: [
          'Breathe slowly for 1 minute (in 4s, out 6s).',
          'Consciously relax your shoulders and unclench your jaw.',
          'Drink some water.'
        ]
      },
      high: {
        title: 'High stress',
        message: 'Significant deviation from baseline detected across multiple readings.',
        steps: [
          '2 to 3 minutes of guided slow breathing.',
          'Try 3 rounds of physiological sigh (two quick inhales, long exhale).',
          'Step away from the screen or current task.',
          'Grounding: 5 things you see, 4 feel, 3 hear, 2 smell, 1 taste.',
          'We will measure your readings again afterwards.'
        ]
      },
      persistent: {
        title: 'Still high',
        message: 'Stress indicators remained elevated even after 3 completed breathing sessions.',
        steps: [
          'Take a longer break away from study/work.',
          'Talk to a friend, mentor, or someone you trust.',
          'If you feel chest pain, dizziness, or trouble breathing, stop and seek medical help.'
        ]
      },
      motion: {
        title: 'Hold still',
        message: 'Measurement paused because of wrist/hand movement.',
        steps: [
          'Keep your wrist still and rest it on the desk.',
          'Optical pulse reading resumes once motion stops.'
        ]
      },
      'weak-signal': {
        title: 'Check the sensor',
        message: 'Low optical signal quality detected (quality ≤ 1).',
        steps: [
          'Press steadily with light, even pressure.',
          'Cover the sensor from bright direct room light.',
          'Ensure the strap is snug but not uncomfortably tight.'
        ]
      },
      abnormal: {
        title: 'Unusual reading',
        message: 'Sensor readings out of expected bounds (<40 or >180 BPM). May be a sensor positioning error.',
        steps: [
          'Re-seat the sensor strap on your wrist.',
          'Wait 30 seconds for the optical filter to stabilize.',
          'If you feel unwell, seek medical attention; this device cannot diagnose.'
        ]
      },
      disconnected: {
        title: 'Disconnected',
        message: 'No active Bluetooth Low Energy connection to the BioAdapt band.',
        steps: [
          'Check that the wristband is powered on and charged.',
          'Ensure Bluetooth is enabled on your phone.',
          'Tap Connect or switch to Demo Mode to test features.'
        ]
      },
      noBaseline: {
        title: 'Baseline Required',
        message: 'No personal baseline saved yet. Stress classification requires a 2-minute calm baseline.',
        steps: [
          'Sit comfortably and relax.',
          'Tap "Record Baseline" to start the 2-minute calibration.'
        ]
      }
    },

    // Navigation & Tabs
    tabs: {
      dashboard: 'Dashboard',
      breathing: 'Breathing',
      history: 'History',
      settings: 'Settings',
    },

    // Live Dashboard
    dashboard: {
      connectionStatus: 'Status',
      demoBanner: 'DEMO DATA, not from the band',
      untestedBleBanner: 'Real Bluetooth LE is UNTESTED on this hardware. Use Demo Mode for testing.',
      heartRate: 'Heart Rate',
      hrv: 'HRV (RMSSD)',
      gsr: 'Skin Conductance (GSR)',
      motion: 'Motion Level',
      signalQuality: 'Signal Quality',
      liveCharts: 'Real-time Trends (Last 5 Minutes)',
      recordBaseline: 'Record 2-Min Baseline',
      recordingBaseline: 'Recording Baseline...',
      baselineSuccess: 'Baseline Saved Successfully!',
      currentBaseline: 'Active Baseline',
      noBaselineWarning: 'Record a baseline while calm to activate personalized classification.',
      packetsReceived: 'Packets Received',
      packetRate: 'Packets/sec',
      errorCount: 'Parser Errors',
      lastRawPacket: 'Last Raw Packet',
      quickStateTest: 'Force State (Demo)',
      cycleDemo: 'Cycle All States',
    },

    // Guided Breathing
    breathing: {
      title: 'Guided Slow Breathing',
      subtitle: 'Paced breathing at 6 breaths per minute to stimulate parasympathetic vagal tone.',
      selectDuration: 'Session Duration',
      inhale: 'Breathe In (4s)',
      exhale: 'Breathe Out (6s)',
      start: 'Start Breathing',
      pause: 'Pause',
      resume: 'Resume',
      stop: 'End Session',
      baselineComparison: 'HRV Comparison',
      beforeHrv: 'Before (30s avg)',
      afterHrv: 'After (30s avg)',
      hrvChange: 'HRV changed by',
      neutralDisclaimer: 'HRV change is observed neutrally. This is not a clinical treatment or medical result.',
      invalidMotionNotice: 'Session comparison was inconclusive due to movement or weak sensor signal.',
      reducedMotion: 'Reduced Motion mode enabled',
    },

    // History & Export
    history: {
      title: 'Session & Calibration History',
      description: 'Stored purely on your device. No cloud synchronization, no accounts, no analytics tracking.',
      exportCsvSessions: 'Export Sessions CSV',
      exportCsvPackets: 'Export Raw Packets CSV',
      clearAllData: 'Clear All Data',
      clearConfirm: 'Are you sure you want to clear all history and baselines? This action cannot be undone.',
      noHistory: 'No sessions or baselines recorded yet.',
      date: 'Timestamp',
      type: 'Type',
      summary: 'Summary',
      duration: 'Duration',
      baselineRecord: 'Baseline Calibration',
      breathingRecord: 'Breathing Session',
    },

    // Settings
    settings: {
      title: 'Settings & Research Thresholds',
      note: 'All thresholds below are PLACEHOLDERS for ISEF research experimentation.',
      modeSection: 'Stress Detection Mode',
      baselineMode: 'Personal Baseline Mode (Default)',
      baselineModeDesc: 'Compares current HRV and GSR drops against your personal resting baseline.',
      simpleMode: 'Simple Fixed GSR Mode',
      simpleModeDesc: 'Classifies stress as high when raw GSR exceeds a fixed threshold.',
      simpleThresholdLabel: 'Simple GSR High Threshold (raw)',
      thresholdSection: 'Baseline Sensitivity Thresholds (Placeholders)',
      hrvMediumDrop: 'HRV Drop for Mild Stress (%)',
      hrvHighDrop: 'HRV Drop for High Stress (%)',
      gsrMediumRise: 'GSR Rise for Mild Stress (%)',
      gsrHighRise: 'GSR Rise for High Stress (%)',
      persistenceLabel: 'State Persistence Before Trigger (seconds)',
      cooldownLabel: 'Alert Cooldown (minutes)',
      alertsSection: 'Notifications & Feedback',
      testAlert: 'Test In-App & Notification Alert',
      mute30Min: 'Mute Alerts for 30 Minutes',
      unmute: 'Unmute Alerts',
      keepScreenOn: 'Keep Screen Awake during monitoring',
      vibration: 'Vibration Haptics',
      backgroundNoticeTitle: 'Notice on Background Monitoring',
      backgroundNoticeText: 'Android restricts BLE and background processing unless run as a foreground service with a persistent notification. In this version, background monitoring is UNTESTED and primarily runs in the foreground.',
      resetDefaults: 'Reset to Defaults',
      savedSuccess: 'Settings saved successfully',
    },

    // Disclaimer Dialog
    disclaimer: {
      title: 'ISEF Research & Safety Disclaimer',
      text1: 'Study Pulse: BioAdapt is a high school research prototype created for the Regeneron ISEF competition (Embedded Systems category).',
      text2: 'It is NOT a medical device. It does NOT diagnose, treat, prevent, or cure any medical or mental health condition.',
      text3: 'Sensor readings from wrist photoplethysmography are prone to motion artifacts. Sensor thresholds are unvalidated research placeholders.',
      text4: 'If you ever feel physical distress, chest tightness, shortness of breath, dizziness, or severe anxiety, stop using the app and seek professional medical assistance immediately.',
      accept: 'I Understand & Agree',
    },

    // Common
    common: {
      connect: 'Connect',
      disconnect: 'Disconnect',
      reconnect: 'Reconnect',
      cancel: 'Cancel',
      confirm: 'Confirm',
      demoMode: 'Demo Mode',
      realBleMode: 'Real BLE Band',
      openSettings: 'Open App Settings',
      enableBluetooth: 'Turn On Bluetooth',
      language: 'Language',
      theme: 'Theme',
      dark: 'Dark',
      light: 'Light',
      auto: 'Auto',
    }
  },

  ar: {
    appName: 'نبض الدراسة: بيو-أدابت',
    tagline: 'مقياس الإجهاد والتوتر الذهني الشخصي للطلاب',
    prototypeNotice: 'نموذج بحثي وتوعوي • ليس جهازاً طبياً • لا يقدم أي تشخيص',
    medicalEmergencyNotice: 'إذا شعرت بأي توعك (ألم بالصدر، دوار، ضيق في التنفس)، توقف فوراً واطلب الرعاية الطبية.',

    // Status & States
    states: {
      calm: {
        title: 'أنت هادئ ومستقر',
        message: 'مؤشراتك الفسيولوجية مستقرة وقريبة من خط الأساس الشخصي.',
        steps: ['واصل دراستك أو عملك بتركيز.', 'هذا وقت مثالي لتسجيل خط الأساس أو تحديثه وأنت مرتاح.']
      },
      medium: {
        title: 'إجهاد خفيف',
        message: 'تم رصد ارتفاع طفيف في مؤشرات التوتر مقارنة بخط الأساس.',
        steps: [
          'تنفس بهدوء لمدة دقيقة واحدة (شهيق 4 ثوانٍ، زفير 6 ثوانٍ).',
          'أرخِ كتفيك وعضلات الفك بوعي.',
          'اشرب بعض الماء.'
        ]
      },
      high: {
        title: 'توتر مرتفع',
        message: 'تم رصد تغير ملحوظ ومستمر في المؤشرات مقارنة بخط الأساس.',
        steps: [
          'تنفس موجه بطيء لمدة 2 إلى 3 دقائق.',
          'جرّب تمرين الزفير الفسيولوجي 3 مرات (شهيقان سريعان يليهما زفير طويل وعميق).',
          'ابتعد قليلاً عن الشاشة أو المهمة الحالية.',
          'تمرين التثبيت الحسي (5 أشياء تراها، 4 تلمسها، 3 تسمعها، 2 تشمها، 1 تتذوقه).',
          'سنقوم بالقياس مرة أخرى بعد انتهاء الاستراحة.'
        ]
      },
      persistent: {
        title: 'التوتر لا يزال مرتفعاً',
        message: 'ما زالت المؤشرات مرتفعة حتى بعد إتمام 3 جلسات تنفس متتالية.',
        steps: [
          'خذ استراحة أطول بعيداً عن جو الدراسة والعمل.',
          'تحدث إلى صديق، معلم، أو شخص تثق به.',
          'إذا شعرت بألم في الصدر أو دوار أو صعوبة في التنفس، توقف فوراً واطلب المساعدة الطبية.'
        ]
      },
      motion: {
        title: 'يرجى التزام الهدوء',
        message: 'توقف القياس مؤقتاً بسبب حركة اليد أو المعصم.',
        steps: [
          'ثبّت معصمك ودعه يستند بهدوء على المكتب.',
          'سيستأنف قياس النبض البصري بمجرد سكون الحركة.'
        ]
      },
      'weak-signal': {
        title: 'تحقق من وضع الحساس',
        message: 'جودة الإشارة الضوئية ضعيفة (المستوى 1 أو أقل).',
        steps: [
          'اضغط برفق وبشكل متوازن على الحساس.',
          'احجب الحساس عن إضاءة الغرفة القوية المباشرة.',
          'تأكد من أن السوار محكم حول المعصم دون تضييق مفرط.'
        ]
      },
      abnormal: {
        title: 'قراءة غير معتادة',
        message: 'القراءات خارج النطاق المتوقع (أقل من 40 أو أكثر من 180 نبضة). قد يكون ناتجاً عن خلل في ثبات الحساس.',
        steps: [
          'أعد ضبط موضع السوار على المعصم.',
          'انتظر 30 ثانية لاستقرار الحساس الضوئي.',
          'إذا كنت تشعر بتعب أو عدم ارتياح، استشر الطبيب؛ هذا الجهاز لا يقدم أي تشخيص.'
        ]
      },
      disconnected: {
        title: 'غير متصل',
        message: 'لا يوجد اتصال بلوتوث حالي بسوار BioAdapt.',
        steps: [
          'تأكد من تشغيل السوار وشحنه جيداً.',
          'تأكد من تفعيل البلوتوث في هاتفك.',
          'اضغط على زر الاتصال أو فعّل الوضع التجريبي لاختبار التطبيق.'
        ]
      },
      noBaseline: {
        title: 'يلزم تسجيل خط الأساس',
        message: 'لم يتم حفظ خط أساس شخصي بعد. يتطلب تصنيف الإجهاد معايرة هادئة لمدة دقيقتين.',
        steps: [
          'اجلس براحة واسترخِ تماماً.',
          'اضغط "تسجيل خط الأساس" لبدء المعايرة لمدة دقيقتين.'
        ]
      }
    },

    tabs: {
      dashboard: 'لوحة القياس',
      breathing: 'جلسة التنفس',
      history: 'السجل',
      settings: 'الإعدادات',
    },

    dashboard: {
      connectionStatus: 'حالة الاتصال',
      demoBanner: 'بيانات تجريبية مُحاكاة، وليست من السوار الفعلي',
      untestedBleBanner: 'اتصال البلوتوث الحقيقي لم يُختبر على العتاد بعد. استخدم الوضع التجريبي للاختبار.',
      heartRate: 'معدل النبض (BPM)',
      hrv: 'تقلب النبض (HRV)',
      gsr: 'توصيل الجلد (GSR)',
      motion: 'مستوى الحركة',
      signalQuality: 'جودة الإشارة',
      liveCharts: 'الرسوم البيانية المباشرة (آخر 5 دقائق)',
      recordBaseline: 'تسجيل خط الأساس (دقيقتان)',
      recordingBaseline: 'جارٍ تسجيل خط الأساس...',
      baselineSuccess: 'تم حفظ خط الأساس بنجاح!',
      currentBaseline: 'خط الأساس النشط',
      noBaselineWarning: 'سجّل خط الأساس وأنت هادئ لتفعيل التحليل المخصص.',
      packetsReceived: 'الحزم المستلمة',
      packetRate: 'حزمة/ثانية',
      errorCount: 'أخطاء القراءة',
      lastRawPacket: 'آخر حزمة خام',
      quickStateTest: 'محاكاة حالة محددة (تجريبي)',
      cycleDemo: 'تبديل دوري لجميع الحالات',
    },

    breathing: {
      title: 'تنفس بطيء موجه',
      subtitle: 'تنفس بنمط هادئ (6 أنفاس في الدقيقة) لتحفيز الجهاز العصبي الباراسمبثاوي.',
      selectDuration: 'مدة الجلسة',
      inhale: 'شهيق (4 ثوانٍ)',
      exhale: 'زفير (6 ثوانٍ)',
      start: 'بدء الجلسة',
      pause: 'إيقاف مؤقت',
      resume: 'متابعة',
      stop: 'إنهاء الجلسة',
      baselineComparison: 'مقارنة تقلب النبض (HRV)',
      beforeHrv: 'قبل الجلسة (متوسط 30ث)',
      afterHrv: 'بعد الجلسة (متوسط 30ث)',
      hrvChange: 'تغير الـ HRV بمقدار',
      neutralDisclaimer: 'يُعرض التغير في تقلب النبض بشكل محايد. هذا ليس علاجاً طبياً أو نتيجة علاجية.',
      invalidMotionNotice: 'تعذر حساب مقارنة الجلسة بدقة بسبب حركة اليد أو ضعف الإشارة أثناء القياس.',
      reducedMotion: 'تم تفعيل وضع تقليل الحركة البصرية',
    },

    history: {
      title: 'سجل الجلسات وخطوط الأساس',
      description: 'البيانات محفوظة محلياً على هاتفك فقط. لا توجد خوادم سحابية، ولا حسابات، ولا تتبع للبيانات.',
      exportCsvSessions: 'تصدير سجل الجلسات (CSV)',
      exportCsvPackets: 'تصدير بيانات الحزم الخام (CSV)',
      clearAllData: 'مسح جميع البيانات',
      clearConfirm: 'هل أنت متأكد من مسح كافة السجلات وخط الأساس؟ لا يمكن التراجع عن هذا الإجراء.',
      noHistory: 'لا توجد جلسات أو سجلات محفوظة بعد.',
      date: 'التوقيت',
      type: 'النوع',
      summary: 'الملخص',
      duration: 'المدة',
      baselineRecord: 'معايرة خط أساس',
      breathingRecord: 'جلسة تنفس',
    },

    settings: {
      title: 'الإعدادات وعتبات البحث',
      note: 'جميع العتبات الحسابية أدناه هي قيم افتراضية قيد التجربة لبحث ISEF وليست معتمدة طبياً.',
      modeSection: 'طريقة رصد الإجهاد',
      baselineMode: 'الاعتماد على خط الأساس الشخصي (افتراضي)',
      baselineModeDesc: 'مقارنة انخفاض تقلب النبض وارتفاع تعرق الجلد بالنسبة لخط أساسك وأنت هادئ.',
      simpleMode: 'الوضع البسيط (عتبة تعرق ثابتة)',
      simpleModeDesc: 'اعتبار الإجهاد مرتفعاً إذا تجاوزت قراءة تعرق الجلد قيمة رقمية ثابتة.',
      simpleThresholdLabel: 'عتبة التعرق الثابتة للوضع البسيط (GSR)',
      thresholdSection: 'عتبات الحساسية بالنسبة لخط الأساس (قيم تجريبية)',
      hrvMediumDrop: 'نسبة هبوط HRV للإجهاد الخفيف (%)',
      hrvHighDrop: 'نسبة هبوط HRV للإجهاد العالي (%)',
      gsrMediumRise: 'نسبة ارتفاع GSR للإجهاد الخفيف (%)',
      gsrHighRise: 'نسبة ارتفاع GSR للإجهاد العالي (%)',
      persistenceLabel: 'مدة ثبات الحالة قبل التنبيه (ثوانٍ)',
      cooldownLabel: 'فترة الهدوء بين التنبيهات (دقائق)',
      alertsSection: 'التنبيهات والإشعارات',
      testAlert: 'اختبار التنبيه داخل التطبيق والإشعار',
      mute30Min: 'كتم التنبيهات لمدة 30 دقيقة',
      unmute: 'إلغاء كتم التنبيهات',
      keepScreenOn: 'إبقاء الشاشة مضاءة أثناء القياس',
      vibration: 'الاهتزاز والتفاعل اللمسي',
      backgroundNoticeTitle: 'تنبيه بخصوص القياس في الخلفية',
      backgroundNoticeText: 'نظام أندرويد يقيد البلوتوث والمعالجة في الخلفية ما لم تعمل كخدمة أمامية بإشعار دائم. في هذا الإصدار، القياس بالخلفية غير مجرب ويعمل التطبيق بصورة أساسية في الواجهة الأمامية.',
      resetDefaults: 'استعادة الإعدادات الافتراضية',
      savedSuccess: 'تم حفظ الإعدادات بنجاح',
    },

    disclaimer: {
      title: 'إخلاء المسؤولية البحثية والأمان (ISEF)',
      text1: 'تطبيق "نبض الدراسة: بيو-أدابت" هو نموذج بحثي مدرسي تم تطويره لمسابقة Regeneron ISEF (فئة النظم المضمنة).',
      text2: 'هذا التطبيق ليس جهازاً طبياً ولا يقدم أي تشخيص أو علاج أو وقاية من أي مرض جسدي أو نفسي.',
      text3: 'قراءات النبض البصرية من المعصم تتأثر بشدة بالحركة، والعتبات الرقمية المستخدمة هي قيم تجريبية غير مصدقة سريرياً.',
      text4: 'إذا شعرت بأي توعك أو ألم بالصدر أو ضيق تنفس أو دوار، توقف فوراً عن استخدام الجهاز واستشر جهة طبية مختصة.',
      accept: 'أوافق وأتفهم ذلك تماماً',
    },

    common: {
      connect: 'اتصال',
      disconnect: 'قطع الاتصال',
      reconnect: 'إعادة الاتصال',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      demoMode: 'الوضع التجريبي',
      realBleMode: 'سوار حقيقي (BLE)',
      openSettings: 'فتح إعدادات التطبيق',
      enableBluetooth: 'تشغيل البلوتوث',
      language: 'اللغة',
      theme: 'المظهر',
      dark: 'داكن',
      light: 'فاتح',
      auto: 'تلقائي',
    }
  }
};
