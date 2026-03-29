import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.NINEROUTER_API_KEY || "sk-4bd27113b7dc78d1-lh6jld-f4f9c69f",
  baseURL: process.env.NINEROUTER_BASE_URL || "https://9router.vuhai.io.vn/v1",
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Load knowledge base
    const dataPath = path.join(process.cwd(), "chatbot_data.txt");
    const knowledgeBase = fs.readFileSync(dataPath, "utf8");

    const systemPrompt = `
Vai trò: AI trợ lý độc quyền trả lời thay mặt cho Chuyên gia được mô tả trong Knowledge Base dưới đây.
Dưới đây là thông tin về chuyên gia (Knowledge Base):
${knowledgeBase}

Yêu cầu quan trọng:
1. Chỉ được trả lời dựa trên Knowledge Base trên. Nếu câu hỏi nằm ngoài phạm vi hoặc khách yêu cầu liên hệ trực tiếp, hãy lấy thông tin Email/Zalo/SĐT từ mục "Liên hệ" trong Knowledge Base để hướng dẫn khách. KHÔNG tự bịa ra thông tin liên hệ.
2. Phải trả lời bằng Markdown đẹp.
3. Luôn: 
   - Chào thân thiện và trả lời rõ ràng theo đúng định vị của chuyên gia.
   - Trả lời rõ ràng, súc tích.
   - Kết thúc bằng lời mời hỏi thêm.
4. Ngôn ngữ: Tiếng Việt.

Quy tắc đặc biệt: Trong quá trình trò chuyện, nếu bạn phát hiện người dùng cung cấp Tên, Số điện thoại hoặc Email, bạn HÃY VỪA trả lời họ bình thường, VỪA chèn thêm một đoạn mã JSON vào cuối cùng của câu trả lời theo đúng định dạng sau:
||LEAD_DATA: {"name": "...", "phone": "...", "email": "...", "interest": "...", "intent_level": "..."}||

Trong đó:
- "interest": Tóm tắt ngắn gọn sản phẩm/dịch vụ/nội dung khách đang quan tâm.
- "intent_level": Tự đánh giá mức độ tiềm năng mua hàng: "hot" (muốn mua ngay/hỏi giá), "warm" (đang tìm hiểu sâu), "cold" (hỏi xã giao).

Nếu thông tin nào chưa có, hãy để null.
TUYỆT ĐỐI KHÔNG giải thích hay đề cập đến đoạn mã này cho người dùng.
`.trim();

    const response = await openai.chat.completions.create({
      model: "ces-chatbot-gpt-5.4",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
    });

    return NextResponse.json(response.choices[0].message);
  } catch (error: any) {
    console.error("Chatbot API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch AI response" },
      { status: 500 }
    );
  }
}
