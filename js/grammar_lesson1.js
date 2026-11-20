// Giải thích ngữ pháp theo bài — giáo trình 新HSK教程1 (nội dung tự biên soạn)
var GRAMMAR_LESSON = window.GRAMMAR_LESSON || {};
GRAMMAR_LESSON[1] = {
  2: [
    { vi: 'Trật tự từ cơ bản', f: 'Chủ ngữ + Vị ngữ (+ Tân ngữ)',
      d: 'Câu tiếng Trung cơ bản theo thứ tự Chủ ngữ – Động từ – Tân ngữ, giống tiếng Việt. Phó từ như 不、也、很 luôn đứng ngay trước động từ hoặc tính từ. Khi hỏi, chỉ cần đặt từ để hỏi (什么、谁…) vào đúng vị trí của thông tin cần hỏi, không đảo trật tự câu.',
      ex: [['我不认识王老师。', 'Tôi không quen thầy Vương.'], ['我也很高兴。', 'Tôi cũng rất vui.'], ['你们老师叫什么名字？', 'Giáo viên của các bạn tên là gì?']] }
  ],
  3: [
    { vi: 'Câu chữ 是', f: 'A + 是 + B　|　A + 不是 + B',
      d: '是 nối hai danh từ với nghĩa "là": A chính là B, hoặc A thuộc loại B. Phủ định dùng 不是 (không nói 没是), câu hỏi thêm 吗 ở cuối. Không dùng 是 trước tính từ: nói 她很忙, không nói 她是忙.',
      ex: [['她是我姐姐，不是我女朋友。', 'Cô ấy là chị gái tôi, không phải bạn gái tôi.'], ['我们老师是中国人。', 'Giáo viên của chúng tôi là người Trung Quốc.'], ['王丽不是法国人，她是泰国人。', 'Vương Lệ không phải người Pháp, cô ấy là người Thái Lan.']] },
    { vi: 'Trợ từ kết cấu 的', f: 'Định ngữ + 的 + Danh từ',
      d: '的 nối định ngữ với danh từ đứng sau, thường tương đương "của", nhưng trật tự ngược với tiếng Việt: 我的名字 = tên của tôi. Trước danh từ chỉ người thân, bạn bè hoặc tập thể có thể bỏ 的 (我姐姐、我们老师); quốc tịch, ngôn ngữ cũng ghép thẳng với danh từ (中国人、中文老师).',
      ex: [['这是谁的手机？', 'Đây là điện thoại của ai?'], ['我姐姐的工作很忙。', 'Công việc của chị gái tôi rất bận.'], ['他是我们的中文老师。', 'Anh ấy là thầy giáo tiếng Trung của chúng tôi.']] },
    { vi: 'Câu hỏi có/không với 吗', f: 'Câu trần thuật + 吗？',
      d: 'Thêm 吗 vào cuối câu trần thuật để hỏi có/không, giống "… không?", "… à?" trong tiếng Việt; trật tự từ giữ nguyên. Câu đã có từ để hỏi như 谁、什么、哪 thì không thêm 吗 (sai: 你是哪国人吗？).',
      ex: [['你认识她吗？', 'Bạn có quen cô ấy không?'], ['你姐姐的工作忙吗？', 'Công việc của chị gái bạn có bận không?'], ['你也是老师吗？', 'Bạn cũng là giáo viên à?']] }
  ],
  4: [
    { vi: 'Câu chữ 有: chỉ sở hữu', f: 'A + 有 + B　|　A + 没有 + B',
      d: '有 nghĩa là "có", cho biết chủ ngữ sở hữu người hoặc vật nào đó. Phủ định chỉ dùng 没有 (hoặc 没), không bao giờ nói 不有; khi phủ định thường bỏ số lượng: 我没有妹妹. Câu hỏi: …有…吗？',
      ex: [['小王有一个姐姐。', 'Tiểu Vương có một chị gái.'], ['王老师有一个儿子和一个女儿。', 'Thầy Vương có một con trai và một con gái.'], ['我没有哥哥，你有吗？', 'Tôi không có anh trai, bạn có không?']] },
    { vi: 'Cách nói số đếm', f: '十 + Số (11–19)　|　Số + 十 (+ Số) (20–99)',
      d: 'Số từ 11 đến 99 ghép hàng chục với hàng đơn vị giống tiếng Việt: 十五 = mười lăm, 三十 = ba mươi, 四十八 = bốn mươi tám. Số 2 đứng trước lượng từ thì nói 两 (两个人); khi đếm, khi 2 ở hàng chục hoặc hàng đơn vị (十二、二十) và trong số thứ tự (第二) thì dùng 二.',
      ex: [['我妈妈今年四十八岁。', 'Mẹ tôi năm nay 48 tuổi.'], ['她儿子二十岁，女儿十二岁。', 'Con trai cô ấy 20 tuổi, con gái 12 tuổi.'], ['我爸爸有两个妹妹。', 'Bố tôi có hai em gái.']] },
    { vi: 'Trợ từ 呢: hỏi "còn… thì sao?"', f: 'Danh từ / Đại từ + 呢？',
      d: 'Đặt 呢 sau danh từ hoặc đại từ để hỏi lại cùng một nội dung vừa nói, nhưng về người hoặc vật khác, nghĩa là "còn … thì sao?". Thường dùng ngay sau một câu kể về mình (我是学生，你呢？); câu hỏi này không thêm 吗.',
      ex: [['我有一个女儿，你呢？', 'Tôi có một con gái, còn bạn?'], ['我哥哥二十岁，你哥哥呢？', 'Anh trai tôi 20 tuổi, còn anh trai bạn?'], ['爸爸很忙，妈妈呢？', 'Bố rất bận, còn mẹ thì sao?']] },
    { vi: 'Lượng từ và cụm số lượng', f: 'Số từ / 这 / 那 / 几 + Lượng từ + Danh từ',
      d: 'Giữa số từ (hoặc 这、那、几) và danh từ phải có lượng từ, giống "cái, con, quyển" trong tiếng Việt; không nói 三孩子 mà nói 三个孩子. 个 là lượng từ dùng rộng rãi nhất; 口 dùng khi đếm số người trong gia đình (几口人).',
      ex: [['我家有五口人：爸爸、妈妈、两个哥哥和我。', 'Nhà tôi có năm người: bố, mẹ, hai anh trai và tôi.'], ['这个孩子几岁？', 'Đứa bé này mấy tuổi?'], ['我们有三个女儿。', 'Chúng tôi có ba cô con gái.']] }
  ],
  5: [
    { vi: 'Cách nói năm, tháng, ngày, thứ', f: '… 年 + … 月 + … 日/号 + 星期…',
      d: 'Thời gian nói từ đơn vị lớn đến nhỏ: năm – tháng – ngày – thứ, ngược với tiếng Việt; năm đọc từng chữ số (二零二六年), ngày dùng 号 khi nói và 日 khi viết. Thứ trong tuần là 星期 + số (星期一 = thứ Hai … 星期六 = thứ Bảy), Chủ nhật là 星期日 hoặc 星期天. Hỏi ngày tháng dùng 几: 几月几号？星期几？',
      ex: [['今天是十一月二十号，星期五。', 'Hôm nay là thứ Sáu, ngày 20 tháng 11.'], ['今年是二零二六年。', 'Năm nay là năm 2026.'], ['星期天是几号？', 'Chủ nhật là ngày mấy?']] },
    { vi: 'Câu vị ngữ danh từ', f: 'Chủ ngữ + Danh từ / Cụm số lượng (không cần 是)',
      d: 'Khi nói ngày tháng, thứ, tuổi, giá tiền…, danh từ hoặc cụm số lượng có thể làm vị ngữ trực tiếp, không cần 是: 今天星期五, 我二十岁. Nhưng câu phủ định bắt buộc dùng 不是: 今天不是星期五 (không nói 今天不星期五).',
      ex: [['今天星期天。', 'Hôm nay Chủ nhật.'], ['我女儿六岁。', 'Con gái tôi 6 tuổi.'], ['今天不是十号，是十一号。', 'Hôm nay không phải mùng 10, mà là ngày 11.']] },
    { vi: 'Động từ năng nguyện 会: biết làm', f: 'S + 会 + V (+ O)　|　S + 不会 + V',
      d: '会 + động từ diễn tả kỹ năng có được nhờ học tập, luyện tập, nghĩa là "biết (làm gì)": 会做饭, 会说汉语. Phủ định là 不会; câu hỏi: 会…吗？ hoặc 会不会…？',
      ex: [['我爸爸会做很多菜。', 'Bố tôi biết nấu nhiều món.'], ['我不会做饭，你会吗？', 'Tôi không biết nấu ăn, bạn có biết không?'], ['你会说中文吗？', 'Bạn có biết nói tiếng Trung không?']] }
  ],
  6: [
    { vi: 'Động từ năng nguyện 想: muốn', f: 'S + 想 + V (+ O)　|　S + 不想 + V',
      d: '想 + động từ diễn tả mong muốn, dự định, nghĩa là "muốn (làm gì)". Phủ định là 不想; câu hỏi: 想…吗？ hoặc dùng từ để hỏi (你想买什么？). Khi đi với danh từ chỉ người, 想 lại có nghĩa là "nhớ": 我想妈妈.',
      ex: [['我想吃包子。', 'Tôi muốn ăn bánh bao.'], ['晚上你想吃什么？', 'Tối nay bạn muốn ăn gì?'], ['我不想喝牛奶。', 'Tôi không muốn uống sữa.']] },
    { vi: 'Câu liên động: mục đích và cách thức', f: 'S + 去/来 + Nơi chốn + V (mục đích)　|　S + 坐 + Phương tiện + 去/来 + Nơi chốn',
      d: 'Một chủ ngữ có hai động từ nối tiếp nhau theo đúng thứ tự diễn ra, không cần từ nối: động từ sau là mục đích của động từ trước (去商店买东西), hoặc động từ trước là cách thức thực hiện động từ sau (坐出租车去). Phủ định đặt 不 trước động từ thứ nhất: 我不去商店买东西.',
      ex: [['我去超市买牛奶。', 'Tôi đi siêu thị mua sữa.'], ['妈妈坐出租车去医院。', 'Mẹ đi taxi đến bệnh viện.'], ['你想去哪儿吃晚饭？', 'Bạn muốn đi đâu ăn tối?']] },
    { vi: 'Đại từ nghi vấn 怎么: hỏi cách thức', f: '怎么 + V？',
      d: '怎么 đặt trước động từ để hỏi cách thức, nghĩa là "… thế nào, bằng cách nào". Khi trả lời, thay 怎么 bằng cách làm cụ thể (坐出租车去); câu hỏi với 怎么 không thêm 吗.',
      ex: [['我们怎么去超市？', 'Chúng ta đi siêu thị bằng cách nào?'], ['这个菜怎么做？', 'Món này làm thế nào?'], ['“手机”怎么写？', 'Từ "手机" viết thế nào?']] }
  ],
  7: [
    { vi: 'Cách nói giờ', f: 'Số + 点 (+ Số + 分)　|　Số + 点半',
      d: 'Giờ nói theo thứ tự buổi – giờ – phút: 晚上八点十分; 半 là "rưỡi", phút dưới 10 thường thêm 零: 七点零五分. 2 giờ nói là 两点, không nói 二点; hỏi giờ dùng 现在几点？',
      ex: [['现在九点零五分。', 'Bây giờ là 9 giờ 5 phút.'], ['我们上午十点半下课。', 'Chúng tôi tan học lúc 10 rưỡi sáng.'], ['下午两点我去医院。', '2 giờ chiều tôi đến bệnh viện.']] },
    { vi: 'Trợ từ 吧: đề nghị, rủ rê', f: 'Câu + 吧！',
      d: '吧 đặt cuối câu để đưa ra lời đề nghị, lời rủ hoặc yêu cầu nhẹ nhàng, giống "… nhé", "… đi" trong tiếng Việt. Chủ ngữ thường là 我们 hoặc 你, và câu có 吧 nghe mềm mỏng hơn câu mệnh lệnh: 我们回家吧.',
      ex: [['我们去吃饭吧！', 'Chúng mình đi ăn cơm nhé!'], ['你明天来我家吧。', 'Ngày mai bạn đến nhà tôi đi.'], ['我今天有事，明天见吧。', 'Hôm nay tôi có việc, mai gặp nhé.']] },
    { vi: 'Vị trí của phó từ và từ chỉ thời gian', f: '(Thời gian) + Chủ ngữ + (Thời gian) + Phó từ + Động từ',
      d: 'Từ chỉ thời gian làm trạng ngữ đặt trước động từ, ở đầu câu hoặc ngay sau chủ ngữ, không đặt cuối câu như tiếng Việt: nói 我早上八点上班, không nói 我上班早上八点. Phó từ như 也、不、很 luôn đứng sau chủ ngữ, ngay trước động từ hoặc tính từ; khi có cả hai, từ chỉ thời gian thường đứng trước phó từ.',
      ex: [['下午三点我不在家。', '3 giờ chiều tôi không có nhà.'], ['我们明天上午也有课。', 'Sáng mai chúng tôi cũng có tiết học.'], ['妈妈晚上很忙。', 'Buổi tối mẹ rất bận.']] },
    { vi: 'Trợ từ 呢 cuối câu hỏi', f: 'Câu hỏi có từ để hỏi + 呢？　|　Danh từ + 呢？(= … ở đâu?)',
      d: '呢 đặt cuối câu hỏi có từ để hỏi (哪儿、什么、几点…) làm giọng hỏi mềm mại, tự nhiên hơn, giống "… thế?", "… nhỉ?"; không dùng cùng 吗. Khi không có ngữ cảnh trước, "Danh từ + 呢？" dùng để hỏi người hoặc vật đó đang ở đâu: 妈妈呢？ = 妈妈在哪儿？',
      ex: [['你现在在哪儿呢？', 'Bây giờ bạn đang ở đâu thế?'], ['晚上我们看什么电影呢？', 'Tối nay chúng mình xem phim gì nhỉ?'], ['我的手机呢？', 'Điện thoại của tôi đâu rồi?']] }
  ],
  8: [
    { vi: 'Từ chỉ phương vị', f: 'Danh từ + 上/下/里/外/前/后 (+ 边)',
      d: 'Các từ 上、下、里、外、前、后 (hoặc 上边、里边、外边…) đứng sau danh từ để chỉ vị trí, ngược với tiếng Việt: 桌子上 = trên bàn, 房间里 = trong phòng. Dạng có 边 có thể đứng một mình làm từ chỉ nơi chốn (外边很冷); sau tên nước, tên thành phố không thêm 里: nói 在中国, không nói 在中国里.',
      ex: [['我的手机在桌子上。', 'Điện thoại của tôi ở trên bàn.'], ['小猫在椅子下边。', 'Con mèo nhỏ ở dưới ghế.'], ['爸爸在外边，妈妈在房间里。', 'Bố ở bên ngoài, mẹ ở trong phòng.']] },
    { vi: 'Giới từ 在: ở, tại', f: 'S + 在 + Nơi chốn + V (+ O)',
      d: 'Cụm "在 + nơi chốn" cho biết hành động diễn ra ở đâu và phải đứng trước động từ, khác với tiếng Việt: nói 我在学校学习, không nói 我学习在学校. Phủ định đặt 不 trước 在.',
      ex: [['我哥哥在超市工作。', 'Anh trai tôi làm việc ở siêu thị.'], ['我们在学校吃午饭。', 'Chúng tôi ăn trưa ở trường.'], ['今天我不在家吃晚饭。', 'Hôm nay tôi không ăn tối ở nhà.']] },
    { vi: 'Động từ năng nguyện 能: có thể', f: 'S + 能 + V (+ O)　|　S + 不能 + V',
      d: '能 + động từ diễn tả có khả năng hoặc có điều kiện để làm gì, nghĩa là "có thể, … được". Khác với 会 (biết làm nhờ học), 能 nhấn mạnh năng lực hoặc hoàn cảnh cho phép; 不能 còn có nghĩa "không được phép". Câu hỏi: 能…吗？',
      ex: [['你十二点能到学校吗？', '12 giờ bạn đến trường được không?'], ['我今天很忙，不能去看电影。', 'Hôm nay tôi rất bận, không đi xem phim được.'], ['我能吃十个饺子！', 'Tôi ăn được mười cái sủi cảo đấy!']] }
  ],
  9: [
    { vi: 'Câu tồn tại: nơi chốn + 有/是', f: 'Nơi chốn + 有 + Số lượng + Danh từ　|　Nơi chốn + 是 + Danh từ',
      d: 'Từ chỉ nơi chốn (thường kèm từ phương vị) đứng đầu câu để nói ở đó có gì: dùng 有 khi giới thiệu sự tồn tại, dùng 是 khi xác định thứ ở đó là gì (前边是商店). Đầu câu không thêm 在: nói 桌子上有书, không nói 在桌子上有书; phủ định của 有 là 没有.',
      ex: [['椅子下边有一只小狗。', 'Dưới ghế có một con chó nhỏ.'], ['我家前边是一个超市。', 'Phía trước nhà tôi là một siêu thị.'], ['房间里没有人。', 'Trong phòng không có ai.']] },
    { vi: 'Thứ tự trạng ngữ thời gian và nơi chốn', f: 'S + Thời gian + 在 + Nơi chốn + V (+ O)',
      d: 'Khi câu có cả thời gian và nơi chốn, thời gian đứng trước, nơi chốn đứng sau, và cả hai đều đặt trước động từ; thời gian cũng có thể đứng đầu câu. Tiếng Việt hay nói "Tôi học ở nhà vào buổi tối", còn tiếng Trung phải nói 我晚上在家学习.',
      ex: [['我星期六下午在家看电视。', 'Chiều thứ Bảy tôi xem tivi ở nhà.'], ['明天晚上我们在饭店吃饭。', 'Tối mai chúng tôi ăn cơm ở nhà hàng.'], ['小王白天在书店工作，晚上在家读书。', 'Ban ngày Tiểu Vương làm việc ở hiệu sách, buổi tối đọc sách ở nhà.']] },
    { vi: 'Số thứ tự với 第', f: '第 + Số từ (+ Lượng từ + Danh từ)',
      d: '第 đặt trước số đếm để tạo số thứ tự, nghĩa là "thứ…": 第一 = thứ nhất, 第二个人 = người thứ hai; trước danh từ vẫn cần lượng từ. Số thứ tự 2 là 第二, không nói 第两; tên tháng và thứ trong tuần không dùng 第 (一月 = tháng Một, 星期一 = thứ Hai).',
      ex: [['这是我的第一本中文书。', 'Đây là quyển sách tiếng Trung đầu tiên của tôi.'], ['今天我们学习第九课。', 'Hôm nay chúng ta học bài thứ chín.'], ['她是我们家的第三个孩子。', 'Cô bé là đứa con thứ ba trong nhà chúng tôi.']] }
  ],
  10: [
    { vi: 'Cách nói số tiền', f: 'Số + 块/元 (+ 钱)　|　… 多少钱？',
      d: 'Khi nói dùng 块, khi viết (bảng giá, hóa đơn) dùng 元; sau 块 có thể thêm 钱: 五块钱. Hỏi giá dùng 多少钱？; số tiền hàng trăm, hàng nghìn ghép như số đếm (一百二十块 = 120 tệ), riêng số 2 đứng trước 百、千 thường nói 两: 两百块, 两千元.',
      ex: [['一个面包多少钱？', 'Một cái bánh mì bao nhiêu tiền?'], ['这件衣服两百八十块。', 'Bộ quần áo này 280 tệ.'], ['我的新手机两千五百块。', 'Điện thoại mới của tôi giá 2.500 tệ.']] },
    { vi: 'Câu vị ngữ tính từ', f: 'S + 很/真/非常 + Tính từ　|　S + 不 + Tính từ',
      d: 'Tính từ làm vị ngữ trực tiếp, không cần 是: 这个苹果很大 (không nói 这个苹果是大). Câu khẳng định thường thêm 很 (nghĩa "rất" khá nhẹ), bỏ 很 thì câu mang ý so sánh; phủ định dùng 不 + tính từ, câu hỏi thêm 吗.',
      ex: [['这个杯子很漂亮，也不贵。', 'Cái cốc này rất đẹp, lại không đắt.'], ['那儿的苹果贵吗？', 'Táo ở chỗ đó có đắt không?'], ['今天我非常高兴。', 'Hôm nay tôi rất vui.']] },
    { vi: 'Đại từ nghi vấn 怎么样', f: 'Chủ ngữ + 怎么样？　|　Lời đề nghị，怎么样？',
      d: '怎么样 làm vị ngữ để hỏi tình hình, tính chất hoặc ý kiến về người, sự vật ("… thế nào?"). Đặt sau một lời đề nghị, 怎么样 dùng để hỏi ý người nghe, giống "… được không?"; câu có 怎么样 không thêm 吗.',
      ex: [['你的新电脑怎么样？', 'Máy tính mới của bạn thế nào?'], ['那家饭店的菜怎么样？', 'Món ăn ở nhà hàng đó thế nào?'], ['我们明天去买水果，怎么样？', 'Ngày mai mình đi mua hoa quả, được không?']] }
  ],
  11: [
    { vi: 'Câu hỏi chính phản (V 不 V)', f: 'V/Tính từ + 不 + V/Tính từ？　|　有没有…？',
      d: 'Ghép dạng khẳng định và phủ định của động từ hoặc tính từ để hỏi, tương đương "có … không?": 你去不去？; với 有 thì dùng 有没有. Câu này đã là câu hỏi nên không thêm 吗 (sai: 你去不去吗？), cũng không dùng cùng các phó từ như 很、也.',
      ex: [['你弟弟是不是大学生？', 'Em trai bạn có phải là sinh viên không?'], ['你明天去不去学校？', 'Ngày mai bạn có đến trường không?'], ['你家有没有电脑？', 'Nhà bạn có máy tính không?']] },
    { vi: 'Phó từ 在/正在: đang', f: 'S + 正在/在 + V (+ O) (+ 呢)　|　S + V (+ O) + 呢',
      d: '正在 hoặc 在 đặt trước động từ diễn tả hành động đang diễn ra, nghĩa là "đang"; 正在 nhấn mạnh "đúng lúc này". Cuối câu có thể thêm 呢, thậm chí chỉ dùng 呢 cũng mang nghĩa đang làm (他上课呢); phủ định dùng 没在 + động từ: 我没在睡觉.',
      ex: [['弟弟正在睡觉呢。', 'Em trai đang ngủ.'], ['妈妈在做饭，爸爸在看电视。', 'Mẹ đang nấu cơm, bố đang xem tivi.'], ['你在找什么？', 'Bạn đang tìm gì thế?']] },
    { vi: 'Động từ năng nguyện 要: muốn, sẽ', f: 'S + 要 + V (+ O)',
      d: '要 + động từ diễn tả ý muốn mạnh, quyết tâm hoặc việc đã định sẽ làm, nghĩa là "muốn, sẽ". Phủ định của nghĩa "muốn" là 不想, không dùng 不要, vì 不要 có nghĩa là "đừng" (不要说话 = đừng nói chuyện).',
      ex: [['我要学开车。', 'Tôi muốn học lái xe.'], ['明天我要去北京。', 'Ngày mai tôi sẽ đi Bắc Kinh.'], ['你要问什么？', 'Bạn muốn hỏi gì?']] }
  ],
  12: [
    { vi: 'Câu không chủ – vị (câu đặc biệt)', f: '(Thời gian) + 下雨/下雪 (+ 了)　|　Từ / cụm từ đứng một mình',
      d: 'Một số câu không có chủ ngữ, chỉ gồm một từ hoặc một cụm từ: câu nói về hiện tượng tự nhiên (下雨了、下雪了), lời chào, lời cảm ơn, câu cảm thán ngắn (谢谢！真好！). Nói về thời tiết thì không cần thêm chủ ngữ kiểu "trời" như tiếng Việt.',
      ex: [['下雪了！真漂亮！', 'Tuyết rơi rồi! Đẹp thật!'], ['下雨了，我们回家吧。', 'Mưa rồi, chúng mình về nhà thôi.'], ['明天下雨吗？', 'Ngày mai có mưa không?']] },
    { vi: 'Trợ từ ngữ khí 了: thay đổi, tình huống mới', f: 'Câu + 了　|　不 + V + 了',
      d: '了 ở cuối câu cho biết sự việc đã thay đổi hoặc xuất hiện tình huống mới, giống "… rồi" trong tiếng Việt: 天冷了. Dạng 不 + động từ + 了 nghĩa là "không … nữa", thường dùng khi thay đổi ý định: 我不去了.',
      ex: [['我妹妹今年十八岁了。', 'Em gái tôi năm nay 18 tuổi rồi.'], ['现在不下雨了。', 'Bây giờ hết mưa rồi.'], ['我生病了，今天不去公司了。', 'Tôi bị ốm rồi, hôm nay không đến công ty nữa.']] },
    { vi: 'Cấu trúc 太…了: quá…', f: '太 + Tính từ + 了　|　不太 + Tính từ',
      d: '太…了 diễn tả mức độ rất cao: có thể là "quá (mức)" mang ý không hài lòng (太贵了), hoặc là lời cảm thán khen ngợi (太好了！). Câu khẳng định không bỏ 了; còn 不太 + tính từ (không có 了) nghĩa là "không … lắm": 不太冷.',
      ex: [['外边太热了！', 'Bên ngoài nóng quá!'], ['这个苹果太好吃了！', 'Quả táo này ngon quá!'], ['这里的水果不太贵。', 'Hoa quả ở đây không đắt lắm.']] }
  ],
  13: [
    { vi: 'Động từ năng nguyện 可以: có thể, được phép', f: 'S + 可以 + V (+ O)　|　我可以…吗？',
      d: '可以 + động từ diễn tả sự cho phép hoặc khả năng do điều kiện cho phép, nghĩa là "có thể, được". Xin phép dùng 我可以…吗？; đồng ý trả lời 可以, từ chối thường dùng 不可以 hoặc 不能.',
      ex: [['我可以喝一点儿水吗？', 'Tôi uống một chút nước được không?'], ['这里不可以打电话。', 'Ở đây không được gọi điện thoại.'], ['明天你可以来我家。', 'Ngày mai bạn có thể đến nhà tôi.']] },
    { vi: 'Cấu trúc động từ + 一下', f: 'V + 一下 (+ O)',
      d: '一下 đặt sau động từ diễn tả hành động diễn ra nhanh, trong thời gian ngắn hoặc làm thử, giống "… một chút", "… thử" trong tiếng Việt. Cấu trúc này làm lời đề nghị, nhờ vả nghe nhẹ nhàng, lịch sự hơn: 请你看一下.',
      ex: [['我们休息一下吧。', 'Chúng ta nghỉ một chút nhé.'], ['你看一下这本书，很好看。', 'Bạn xem thử quyển sách này đi, hay lắm.'], ['你来一下，我有事。', 'Bạn qua đây một chút, tôi có việc.']] },
    { vi: 'Câu có hai tân ngữ', f: 'S + V + Tân ngữ 1 (người) + Tân ngữ 2 (vật)',
      d: 'Một số động từ như 给、问 có thể mang hai tân ngữ: người nhận đứng trước, sự vật đứng sau. Không đảo thứ tự: nói 给他一本书, không nói 给一本书他.',
      ex: [['妈妈给我一百块钱。', 'Mẹ cho tôi một trăm tệ.'], ['我想问你一个问题。', 'Tôi muốn hỏi bạn một câu.'], ['服务员，请给我们两杯水。', 'Phục vụ ơi, cho chúng tôi hai cốc nước.']] }
  ],
  14: [
    { vi: 'Trợ từ động thái 了: hành động hoàn thành', f: 'S + V + 了 + Số lượng + O　|　S + 没(有) + V',
      d: '了 đứng ngay sau động từ cho biết hành động đã hoàn thành; nếu có tân ngữ thì tân ngữ thường kèm số lượng hoặc định ngữ: 我买了三本书. Phủ định dùng 没(有) + động từ và bỏ 了 (không nói 我没买了); câu hỏi: …了吗？ hoặc …了没有？',
      ex: [['我昨天写了五十个汉字。', 'Hôm qua tôi đã viết năm mươi chữ Hán.'], ['妈妈买了一些水果。', 'Mẹ đã mua một ít hoa quả.'], ['昨天晚上我没看电视。', 'Tối hôm qua tôi không xem tivi.']] },
    { vi: 'Từ li hợp', f: 'V + (了…) + O　|　和 + Người + từ li hợp',
      d: 'Từ li hợp như 睡觉、说话、上课、下课、上班、下班、看病、生病 có cấu tạo "động từ + tân ngữ", nên có thể chen 了 hoặc thành phần khác vào giữa: 下了课, 看了病. Chúng không mang thêm tân ngữ phía sau; muốn nói "với ai" thì đặt 和 + người lên trước: 我和他说话, không nói 我说话他.',
      ex: [['下了课，我们去书店吧。', 'Tan học xong, chúng mình đi hiệu sách nhé.'], ['上午我去医院看了病，下午在家休息。', 'Buổi sáng tôi đi bệnh viện khám bệnh, buổi chiều nghỉ ở nhà.'], ['上课的时候不要和同学说话。', 'Trong giờ học đừng nói chuyện với bạn.']] },
    { vi: 'Phó từ phạm vi 都: đều', f: 'Chủ ngữ (số nhiều) + 都 + V/Tính từ',
      d: '都 nghĩa là "đều, tất cả", tổng kết những người hoặc vật đứng trước nó, nên phải đặt sau chủ ngữ và trước động từ (không nói 都我们是学生). 都不 là "đều không", còn 不都 là "không phải tất cả đều".',
      ex: [['我们都是中学生。', 'Chúng tôi đều là học sinh trung học.'], ['这些汉字我都会写。', 'Những chữ Hán này tôi đều biết viết.'], ['我和妹妹都不会开车。', 'Tôi và em gái đều không biết lái xe.']] }
  ],
  15: [
    { vi: 'Câu ghép đẳng lập với 也 / 还', f: 'Vế 1，(Chủ ngữ) + 也 + V…　|　Vế 1，还 + V…',
      d: '也 ("cũng") nối hai vế có nội dung giống nhau hoặc song song, dù cùng hay khác chủ ngữ; 还 ("còn, ngoài ra còn") bổ sung thêm một việc nữa của cùng chủ ngữ. 也 và 还 luôn đứng sau chủ ngữ, trước động từ của vế sau, không đứng đầu vế câu (không nói 也我是医生).',
      ex: [['爸爸是医生，妈妈也是医生。', 'Bố là bác sĩ, mẹ cũng là bác sĩ.'], ['我爱吃饺子，也爱吃包子。', 'Tôi thích ăn sủi cảo, cũng thích ăn bánh bao.'], ['昨天我买了水果，还买了一些牛奶。', 'Hôm qua tôi mua hoa quả, còn mua thêm ít sữa.']] }
  ]
};
window.GRAMMAR_LESSON = GRAMMAR_LESSON;
