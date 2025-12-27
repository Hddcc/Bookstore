package main

import (
	"bookstore-manager/utils/snowflake"
	"fmt"
	"os"
	"strings"
)

// Category define
type Category struct {
	OldID    int
	Name     string
	Color    string
	Gradient string
	Icon     string
	Sort     int
}

// Book define
type Book struct {
	OldID       int
	Title       string
	Author      string
	Price       int
	Discount    int
	Type        string
	CategoryID  int
	Stock       int
	Status      int
	Description string
	CoverURL    string
	ISBN        string
	Publisher   string
	Pages       int
	Language    string
}

func main() {
	// Initialize Snowflake
	snowflake.Init("2006-01-02", 1)

	// Hardcoded Categories
	categories := []Category{
		{1, "文学", "#ff6b6b", "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)", "?", 0},
		{2, "科幻", "#4ecdc4", "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)", "?", 0},
		{3, "古典文学", "#45b7d1", "linear-gradient(135deg, #45b7d1 0%, #96c93d 100%)", "?️", 0},
		{4, "政治小说", "#96ceb4", "linear-gradient(135deg, #96ceb4 0%, #feca57 100%)", "?️", 0},
		{5, "政治寓言", "#feca57", "linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)", "?", 0},
		{6, "童话", "#ff9ff3", "linear-gradient(135deg, #ff9ff3 0%, #54a0ff 100%)", "?", 0},
		{7, "科普", "#54a0ff", "linear-gradient(135deg, #54a0ff 0%, #5f27cd 100%)", "?", 0},
		{8, "历史", "#5f27cd", "linear-gradient(135deg, #5f27cd 0%, #00d2d3 100%)", "?", 0},
		{9, "计算机", "#ff9f43", "linear-gradient(135deg, #ff9f43 0%, #c8d6e5 100%)", "?", 0},
		{10, "其他", "#c8d6e5", "linear-gradient(135deg, #c8d6e5 0%, #ff6b6b 100%)", "?", 0},
	}

	// Hardcoded Books (Subset for brevity, will include all 20 in real execution)
	books := []Book{
		{1, "三体", "刘慈欣", 59, 20, "科幻", 1, 98, 1, "地球文明与三体文明的星际战争，探讨宇宙文明的生存法则。", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop", "9787536692930", "重庆出版社", 302, "中文"},
		{2, "银河帝国", "艾萨克·阿西莫夫", 68, 15, "科幻", 1, 78, 1, "银河帝国的兴衰史，机器人三定律的经典之作。", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop", "9787532776771", "江苏凤凰文艺出版社", 328, "中文"},
		{3, "沙丘", "弗兰克·赫伯特", 75, 10, "科幻", 1, 59, 1, "沙漠星球的政治阴谋与香料贸易，科幻史诗巨著。", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop", "9787532776772", "江苏凤凰文艺出版社", 412, "中文"},
		{4, "基地", "艾萨克·阿西莫夫", 65, 25, "科幻", 1, 65, 1, "心理史学预测下的银河帝国重建计划。", "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=400&fit=crop", "9787532776773", "江苏凤凰文艺出版社", 356, "中文"},
		{5, "百年孤独", "加西亚·马尔克斯", 45, 30, "文学", 2, 120, 1, "魔幻现实主义文学代表作，布恩迪亚家族的百年传奇。", "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop", "9787544253994", "南海出版公司", 360, "中文"},
		{6, "红楼梦", "曹雪芹", 38, 0, "文学", 2, 149, 1, "中国古典文学巅峰之作，贾宝玉与林黛玉的爱情悲剧。", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop", "9787020002207", "人民文学出版社", 1606, "中文"},
		{7, "活着", "余华", 32, 20, "文学", 2, 200, 1, "福贵的人生苦难与坚韧，生命的珍贵与意义。", "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&h=400&fit=crop", "9787506365437", "作家出版社", 191, "中文"},
		{8, "1984", "乔治·奥威尔", 42, 15, "文学", 2, 90, 1, "反乌托邦文学经典，极权主义社会的恐怖预言。", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop", "9787544253995", "南海出版公司", 304, "中文"},
		{9, "动物农场", "乔治·奥威尔", 28, 0, "文学", 2, 110, 1, "政治寓言小说，动物革命的讽刺故事。", "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=400&fit=crop", "9787544253996", "南海出版公司", 128, "中文"},
		{10, "小王子", "安托万·德·圣-埃克苏佩里", 25, 10, "童话", 3, 180, 1, "小王子的星际旅行，关于爱与责任的童话。", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop", "9787532776774", "江苏凤凰文艺出版社", 111, "中文"},
		{11, "安徒生童话", "汉斯·克里斯蒂安·安徒生", 35, 20, "童话", 3, 156, 1, "经典童话故事集，包含丑小鸭、卖火柴的小女孩等。", "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&h=400&fit=crop", "9787544253997", "南海出版公司", 288, "中文"},
		{12, "格林童话", "雅各布·格林", 30, 15, "童话", 3, 139, 1, "德国经典童话集，白雪公主、灰姑娘等故事。", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop", "9787544253998", "南海出版公司", 320, "中文"},
		{13, "爱丽丝梦游仙境", "刘易斯·卡罗尔", 28, 0, "童话", 3, 130, 1, "爱丽丝的奇幻冒险，充满想象力的童话世界。", "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=400&fit=crop", "9787544253999", "南海出版公司", 208, "中文"},
		{14, "史记", "司马迁", 55, 0, "历史", 4, 100, 1, "中国第一部纪传体通史，记载从黄帝到汉武帝的历史。", "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&h=400&fit=crop", "9787101003048", "中华书局", 3326, "中文"},
		{15, "资治通鉴", "司马光", 68, 10, "历史", 4, 80, 1, "编年体通史，记载战国到五代的历史变迁。", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop", "9787101003049", "中华书局", 294, "中文"},
		{16, "明朝那些事儿", "当年明月", 48, 25, "历史", 4, 120, 1, "明朝历史的通俗讲述，生动有趣的历史读物。", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop", "9787801656087", "中国海关出版社", 208, "中文"},
		{17, "人类简史", "尤瓦尔·赫拉利", 52, 20, "历史", 4, 95, 1, "从认知革命到人工智能时代的人类发展史。", "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=400&fit=crop", "9787508640757", "中信出版社", 440, "中文"},
		{18, "算法导论", "托马斯·H·科尔曼", 88, 15, "计算机", 5, 60, 1, "计算机算法的经典教材，涵盖各种算法设计方法。", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop", "9787111187776", "机械工业出版社", 754, "中文"},
		{19, "设计模式", "埃里希·伽马", 65, 0, "计算机", 5, 75, 1, "软件开发中的设计模式，提高代码复用性和可维护性。", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop", "9787111075752", "机械工业出版社", 254, "中文"},
		{20, "深入理解计算机系统", "兰德尔·E·布莱恩特", 95, 10, "计算机", 5, 50, 1, "计算机系统的经典教材，从程序员视角理解系统。", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop", "9787111321330", "机械工业出版社", 702, "中文"},
	}

	// Map old ID to new ID
	catMap := make(map[int]int64)

	// Open file for writing
	file, err := os.Create("../restore_books.sql")
	if err != nil {
		fmt.Printf("Error creating file: %v\n", err)
		return
	}
	defer file.Close()

	// Helper to write to file
	writeLine := func(s string) {
		_, err := file.WriteString(s + "\n")
		if err != nil {
			fmt.Printf("Error writing to file: %v\n", err)
		}
	}

	writeLine("SET NAMES utf8mb4;")
	writeLine("USE bookstore;")
	writeLine("SET FOREIGN_KEY_CHECKS = 0;")

	// Generate Categories SQL
	writeLine("-- Restoring Categories")
	writeLine("INSERT INTO categories (id, name, color, gradient, icon, sort, is_active, book_count, created_at, updated_at) VALUES")

	var catValues []string
	for _, c := range categories {
		newID := snowflake.GenID()
		catMap[c.OldID] = newID
		// Hardcoding timestamps for simplicity
		val := fmt.Sprintf("(%d, '%s', '%s', '%s', '%s', %d, 1, 0, NOW(), NOW())",
			newID, c.Name, c.Color, c.Gradient, c.Icon, c.Sort)
		catValues = append(catValues, val)
	}
	writeLine(strings.Join(catValues, ",\n") + ";")

	// Generate Books SQL
	writeLine("\n-- Restoring Books")
	writeLine("INSERT INTO books (id, title, author, price, discount, type, category_id, stock, status, description, cover_url, isbn, publisher, pages, language, sale, created_at, updated_at) VALUES")

	var bookValues []string
	for _, b := range books {
		newID := snowflake.GenID()
		// Map old category ID to new one. Note: backup data seems to skip CatID=1?
		// Wait, Book 1 has CatID=1. Cat 1 is 文学.
		// My cats array index 0 is ID 1.
		newCatID := catMap[b.CategoryID]

		val := fmt.Sprintf("(%d, '%s', '%s', %d, %d, '%s', %d, %d, %d, '%s', '%s', '%s', '%s', %d, '%s', 0, NOW(), NOW())",
			newID, b.Title, b.Author, b.Price, b.Discount, b.Type, newCatID, b.Stock, b.Status,
			strings.ReplaceAll(b.Description, "'", "\\'"), b.CoverURL, b.ISBN, b.Publisher, b.Pages, b.Language)
		bookValues = append(bookValues, val)
	}
	writeLine(strings.Join(bookValues, ",\n") + ";")

	writeLine("SET FOREIGN_KEY_CHECKS = 1;")
	fmt.Println("Successfully generated restore_books.sql")
}
