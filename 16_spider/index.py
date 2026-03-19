import sys
import jieba
from wordcloud import WordCloud
import matplotlib.pyplot as plt
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

titles = sys.argv[1:]

# 对文章标题做分词（只展示分词结果，不手动统计词频）
tokens = []
for title in titles:
    tokens.extend([w.strip() for w in jieba.cut(title) if w.strip()])

# 直接输出分词结果
print(tokens)

# 生成词云（从分词后的文本生成，不传入“词频字典”）
font_path = Path('simhei.ttf')
if not font_path.exists():
    win_simhei = Path(r'C:\Windows\Fonts\simhei.ttf')
    if win_simhei.exists():
        font_path = win_simhei
    else:
        font_path = None

wc = WordCloud(
    font_path=str(font_path) if font_path else None,
    background_color='white',
    width=800,
    height=600,
)
wc.generate(' '.join(tokens))
wc.to_file('wordcloud.png')

# 显示词云
plt.imshow(wc, interpolation='bilinear')
plt.axis('off')
plt.show()
