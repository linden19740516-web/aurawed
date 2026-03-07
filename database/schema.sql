-- AuraWed AI婚礼策划平台 - 数据库表结构
-- 在 Supabase SQL Editor 中执行此脚本

-- ============================================
-- 1. 用户资料表
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('couple', 'planner')),
    avatar_url TEXT,
    company_name TEXT,  -- 策划师专用
    phone TEXT,
    city TEXT,  -- 城市（用于匹配）
    service_type TEXT,  -- 策划师服务类型：'remote' | 'full' | NULL
    service_price DECIMAL(10, 2),  -- 服务价格
    bio TEXT,  -- 策划师简介
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_user_type ON user_profiles(user_type);
CREATE INDEX idx_user_profiles_city ON user_profiles(city);

-- ============================================
-- 2. 邀请码表
-- ============================================
CREATE TABLE IF NOT EXISTS invite_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    used BOOLEAN DEFAULT FALSE,
    used_by UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_invite_codes_code ON invite_codes(code);

-- ============================================
-- 3. 婚礼项目表
-- ============================================
CREATE TABLE IF NOT EXISTS weddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES user_profiles(id),
    planner_id UUID REFERENCES user_profiles(id),
    city TEXT NOT NULL,  -- 婚礼举办城市
    name TEXT NOT NULL,
    wedding_date DATE,
    budget DECIMAL(12, 2),
    guest_count INTEGER DEFAULT 0,
    -- 策划师服务需求
    need_planner BOOLEAN DEFAULT FALSE,  -- 是否需要策划师
    planner_service_type TEXT,  -- 需要的服务的类型：'remote' | 'full'
    planner_status TEXT DEFAULT 'pending' CHECK (planner_status IN ('pending', 'matched', 'contacted', 'confirmed', 'rejected')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'story', 'planning', 'finalized', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_weddings_couple ON weddings(couple_id);
CREATE INDEX idx_weddings_planner ON weddings(planner_id);
CREATE INDEX idx_weddings_status ON weddings(status);
CREATE INDEX idx_weddings_city ON weddings(city);

-- ============================================
-- 4. 婚礼故事表（新人填写）
-- ============================================
CREATE TABLE IF NOT EXISTS wedding_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    -- 心理学维度
    love_story TEXT,          -- 爱情故事
    meaningful_moments TEXT,  -- 难忘时刻
    shared_interests TEXT,    -- 共同爱好
    values_and_beliefs TEXT,  -- 价值观
    family_background TEXT,   -- 家庭背景
    -- 婚礼期望
    dream_wedding TEXT,       -- 梦想中的婚礼
    must_have_elements TEXT,  -- 必备元素
    must_avoid TEXT,           -- 想要避免的
    special_requirements TEXT,-- 特殊要求
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_wedding_stories_wedding ON wedding_stories(wedding_id);

-- ============================================
-- 5. 美学标签表
-- ============================================
CREATE TABLE IF NOT EXISTS aesthetic_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('color', 'style', 'mood', 'element', 'material')),
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. 婚礼方案表（AI生成）
-- ============================================
CREATE TABLE IF NOT EXISTS wedding_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    version INTEGER DEFAULT 1,
    -- AI生成的内容
    concept_name TEXT,            -- 概念名称
    concept_description TEXT,     -- 概念描述
    color_palette TEXT,           -- 配色方案 (JSON)
    style_direction TEXT,         -- 风格方向
    layout_description TEXT,      -- 布局描述
    floral_description TEXT,      -- 花艺描述
    lighting_description TEXT,    -- 灯光描述
    timeline_suggestion TEXT,     -- 时间线建议
    budget_breakdown TEXT,        -- 预算分配 (JSON)
    ai_prompt_used TEXT,          -- 使用的AI提示词
    image_urls TEXT,              -- 生成的图片 URLs (JSON array)
    -- 状态
    is_published BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_wedding_plans_wedding ON wedding_plans(wedding_id);
CREATE INDEX idx_wedding_plans_published ON wedding_plans(wedding_id, is_published);

-- ============================================
-- 7. 方案-美学标签关联表
-- ============================================
CREATE TABLE IF NOT EXISTS plan_tags (
    plan_id UUID NOT NULL REFERENCES wedding_plans(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES aesthetic_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (plan_id, tag_id)
);

-- ============================================
-- 8. 聊天记录表（与AI对话）
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_wedding ON chat_messages(wedding_id);

-- ============================================
-- 9. 定时任务记录表
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    task_type TEXT NOT NULL CHECK (task_type IN ('wedding_inspiration', 'ai_news', 'property_alert', 'custom')),
    cron_expression TEXT NOT NULL,
    prompt_template TEXT,  -- AI提示词模板
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scheduled_tasks_user ON scheduled_tasks(user_id);
CREATE INDEX idx_scheduled_tasks_active ON scheduled_tasks(user_id, is_active);

-- ============================================
-- 10. 生成的媒体文件表
-- ============================================
CREATE TABLE IF NOT EXISTS media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES wedding_plans(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio', 'document')),
    storage_path TEXT NOT NULL,
    public_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_media_files_wedding ON media_files(wedding_id);
CREATE INDEX idx_media_files_plan ON media_files(plan_id);

-- ============================================
-- 11. 策划师服务地区表
-- ============================================
CREATE TABLE IF NOT EXISTS planner_service_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    city TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(planner_id, city)
);

CREATE INDEX idx_planner_service_areas_planner ON planner_service_areas(planner_id);
CREATE INDEX idx_planner_service_areas_city ON planner_service_areas(city);

-- ============================================
-- 12. 策划师作品集表
-- ============================================
CREATE TABLE IF NOT EXISTS planner_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    images TEXT[],  -- 作品图片数组
    wedding_style TEXT,  -- 婚礼风格标签
    city TEXT,  -- 举办城市
    venue_type TEXT,  -- 场地类型
    budget_range TEXT,  -- 预算范围
    guest_count INTEGER,  -- 宾客人数
    is_public BOOLEAN DEFAULT TRUE,  -- 是否公开
    likes_count INTEGER DEFAULT 0,  -- 点赞数
    views_count INTEGER DEFAULT 0,  -- 浏览数
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_planner_portfolios_planner ON planner_portfolios(planner_id);
CREATE INDEX idx_planner_portfolios_public ON planner_portfolios(planner_id, is_public);
CREATE INDEX idx_planner_portfolios_city ON planner_portfolios(city);

-- ============================================
-- RLS 策略 (Row Level Security)
-- ============================================

-- 用户只能查看自己的资料
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- 婚礼项目权限
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple can view own weddings"
    ON weddings FOR SELECT
    USING (auth.uid() = couple_id);

CREATE POLICY "Planner can view assigned weddings"
    ON weddings FOR SELECT
    USING (auth.uid() = planner_id);

CREATE POLICY "Users can create weddings"
    ON weddings FOR INSERT
    WITH CHECK (auth.uid() = couple_id);

CREATE POLICY "Users can update own weddings"
    ON weddings FOR UPDATE
    USING (auth.uid() = couple_id OR auth.uid() = planner_id);

-- 婚礼故事权限
ALTER TABLE wedding_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple can manage own story"
    ON wedding_stories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM weddings
            WHERE weddings.id = wedding_stories.wedding_id
            AND weddings.couple_id = auth.uid()
        )
    );

-- 婚礼方案权限
ALTER TABLE wedding_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple can view own plans"
    ON wedding_plans FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM weddings
            WHERE weddings.id = wedding_plans.wedding_id
            AND (weddings.couple_id = auth.uid() OR weddings.planner_id = auth.uid())
        )
    );

CREATE POLICY "Planner can create plans"
    ON wedding_plans FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM weddings
            WHERE weddings.id = wedding_plans.wedding_id
            AND weddings.planner_id = auth.uid()
        )
    );

-- 聊天记录权限
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat participants can view messages"
    ON chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM weddings
            WHERE weddings.id = chat_messages.wedding_id
            AND (weddings.couple_id = auth.uid() OR weddings.planner_id = auth.uid())
        )
    );

CREATE POLICY "Chat participants can insert messages"
    ON chat_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM weddings
            WHERE weddings.id = chat_messages.wedding_id
            AND (weddings.couple_id = auth.uid() OR weddings.planner_id = auth.uid())
        )
    );

-- 定时任务权限
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tasks"
    ON scheduled_tasks FOR ALL
    USING (auth.uid() = user_id);

-- 媒体文件权限
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Related users can view media"
    ON media_files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM weddings
            WHERE weddings.id = media_files.wedding_id
            AND (weddings.couple_id = auth.uid() OR weddings.planner_id = auth.uid())
        )
    );

-- ============================================
-- 作品集权限
-- ============================================
ALTER TABLE planner_portfolios ENABLE ROW LEVEL SECURITY;

-- 公开的作品集所有人都可以查看
CREATE POLICY "Public portfolios are viewable by everyone"
    ON planner_portfolios FOR SELECT
    USING (is_public = true);

-- 策划师可以管理自己的作品集
CREATE POLICY "Planners can manage own portfolios"
    ON planner_portfolios FOR ALL
    USING (auth.uid() = planner_id);

-- ============================================
-- 存储桶设置 (用于媒体文件)
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('wedding-media', 'wedding-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public access to wedding media"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'wedding-media');

CREATE POLICY "Authenticated users can upload"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'wedding-media' AND auth.role() = 'authenticated');

CREATE POLICY "Owners can delete own media"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'wedding-media' AND auth.role() = 'authenticated');

-- ============================================
-- 13. 用户个人设置表（情侣用户）
-- ============================================
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    -- 预算偏好
    budget_min DECIMAL(12, 2),
    budget_max DECIMAL(12, 2),
    -- 颜色偏好
    preferred_colors TEXT[],  -- 喜欢的颜色数组
    -- 个人标签
    personal_tags TEXT[],  -- 个人标签数组
    -- 婚礼相关偏好
    preferred_season TEXT[],  -- 喜欢的季节
    preferred_venue_type TEXT[],  -- 喜欢的场地类型
    guest_count_min INTEGER,
    guest_count_max INTEGER,
    -- 其他
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_user_settings_user ON user_settings(user_id);

-- ============================================
-- 14. 策划师风格标签表
-- ============================================
CREATE TABLE IF NOT EXISTS planner_style_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    tag_category TEXT,  -- 'style', 'color', 'mood', 'element'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(planner_id, tag_name)
);

CREATE INDEX idx_planner_style_tags_planner ON planner_style_tags(planner_id);

-- ============================================
-- 15. 策划师作品集详细项目表（支持多图片）
-- ============================================
CREATE TABLE IF NOT EXISTS planner_portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    wedding_date DATE,
    city TEXT,
    venue_name TEXT,
    venue_type TEXT,
    budget_range TEXT,
    guest_count INTEGER,
    style_tags TEXT[],  -- 风格标签
    cover_image TEXT,
    images JSONB,  -- 多张图片数组，包含URL和元数据
    is_public BOOLEAN DEFAULT TRUE,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_planner_portfolio_items_planner ON planner_portfolio_items(planner_id);
CREATE INDEX idx_planner_portfolio_items_public ON planner_portfolio_items(planner_id, is_public);

-- ============================================
-- RLS 策略 - 用户设置
-- ============================================
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
    ON user_settings FOR ALL
    USING (auth.uid() = user_id);

-- ============================================
-- RLS 策略 - 策划师风格标签
-- ============================================
ALTER TABLE planner_style_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view planner style tags"
    ON planner_style_tags FOR SELECT
    USING (true);

CREATE POLICY "Planners can manage own style tags"
    ON planner_style_tags FOR ALL
    USING (auth.uid() = planner_id);

-- ============================================
-- RLS 策略 - 策划师作品集项目
-- ============================================
ALTER TABLE planner_portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public portfolio items are viewable by everyone"
    ON planner_portfolio_items FOR SELECT
    USING (is_public = true);

CREATE POLICY "Planners can manage own portfolio items"
    ON planner_portfolio_items FOR ALL
    USING (auth.uid() = planner_id);

-- ============================================
-- 更新触发器 (updated_at 自动更新)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weddings_updated_at
    BEFORE UPDATE ON weddings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wedding_stories_updated_at
    BEFORE UPDATE ON wedding_stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wedding_plans_updated_at
    BEFORE UPDATE ON wedding_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_tasks_updated_at
    BEFORE UPDATE ON scheduled_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planner_portfolio_items_updated_at
    BEFORE UPDATE ON planner_portfolio_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 初始管理员邀请码 (可选)
-- ============================================
-- INSERT INTO invite_codes (code, expires_at)
-- VALUES ('AURAWED2026', NOW() + INTERVAL '1 year');
