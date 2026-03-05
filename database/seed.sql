-- AuraWed 测试数据
-- 在 Supabase SQL Editor 中执行此脚本

-- ============================================
-- 添加初始美学标签
-- ============================================

-- 配色分类
INSERT INTO aesthetic_tags (name, category, description) VALUES
('晨曦金', 'color', '温暖柔和的金色，如同清晨第一缕阳光'),
('暮光粉', 'color', '温柔的粉色调，营造浪漫氛围'),
('深海蓝', 'color', '深邃宁静的蓝色，象征永恒'),
('森林绿', 'color', '自然生机的绿色，清新脱俗'),
('月光白', 'color', '纯净优雅的白色，经典永不过时'),
('酒红', 'color', '浓郁复古的红色，热情而深沉'),
('薰衣草紫', 'color', '梦幻优雅的紫色，神秘而浪漫'),
('薄荷绿', 'color', '清爽舒适的绿色，现代感十足')
ON CONFLICT (name) DO NOTHING;

-- 风格分类
INSERT INTO aesthetic_tags (name, category, description) VALUES
('极简主义', 'style', '简洁线条，大面积留白'),
('波西米亚', 'style', '自由浪漫，吉普赛风情'),
('新中式', 'style', '传统与现代融合，东方美学'),
('森系', 'style', '自然原木，森林气息'),
('复古宫廷', 'style', '奢华古典，欧式典雅'),
('现代简约', 'style', '几何线条，时尚大气'),
('田园乡村', 'style', '温馨朴实，花草环绕'),
('水晶梦幻', 'style', '晶莹剔透，星光璀璨')
ON CONFLICT (name) DO NOTHING;

-- 氛围分类
INSERT INTO aesthetic_tags (name, category, description) VALUES
('温馨浪漫', 'mood', '温暖甜蜜的爱情氛围'),
('神圣庄严', 'mood', '庄重典雅的仪式感'),
('轻松欢乐', 'mood', '欢乐愉悦的派对氛围'),
('神秘梦幻', 'mood', '如梦似幻的奇妙体验'),
('自然清新', 'mood', '清新自然的舒适感'),
('复古怀旧', 'mood', '怀旧复古的温馨氛围'),
('高端定制', 'mood', '奢华精致的品质感')
ON CONFLICT (name) DO NOTHING;

-- 元素分类
INSERT INTO aesthetic_tags (name, category, description) VALUES
('花艺拱门', 'element', '鲜花搭建的仪式拱门'),
('星光灯串', 'element', '温馨浪漫的灯光装饰'),
('水晶吊饰', 'element', '璀璨华丽的水晶装饰'),
('绸缎布置', 'element', '柔软光滑的绸缎布置'),
('木质架构', 'element', '自然原木的架构设计'),
('纱幔帷幔', 'element', '轻柔飘逸的纱幔装饰'),
('镜面T台', 'element', '现代时尚的镜面T台'),
('喷泉流水', 'element', '水景装饰，增添灵动')
ON CONFLICT (name) DO NOTHING;

-- 材质分类
INSERT INTO aesthetic_tags (name, category, description) VALUES
('鲜花', 'material', '真花，生命周期短但真实'),
('仿真花', 'material', '高仿真花，可重复使用'),
('干花', 'material', '干燥处理后的花材，复古质感'),
('永生花', 'material', '特殊处理保持长久色泽'),
('绸缎', 'material', '光滑柔软的高端布料'),
('麻布', 'material', '自然粗犷的田园质感'),
('蕾丝', 'material', '精致细腻的蕾丝面料'),
('玻璃', 'material', '通透现代的玻璃材质')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 添加初始邀请码
-- ============================================
INSERT INTO invite_codes (code, expires_at) VALUES
('PLANNER2026', NOW() + INTERVAL '1 year'),
('VIPCOUPLE', NOW() + INTERVAL '1 year'),
('TESTMODE', NOW() + INTERVAL '30 days')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 验证数据
-- ============================================
SELECT '美学标签总数:' AS info, COUNT(*) FROM aesthetic_tags;
SELECT '邀请码总数:' AS info, COUNT(*) FROM invite_codes;
