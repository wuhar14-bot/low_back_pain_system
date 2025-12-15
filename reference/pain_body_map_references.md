# Pain Body Map References

收集的疼痛区域身体地图参考资源，用于设计Low Back Pain System的可点击疼痛区域。

---

## CHOIR Body Map (Stanford) - 推荐

CHOIR (Collaborative Health Outcomes Information Registry) 是斯坦福大学开发的专业疼痛评估工具。

- **后视图**: 38个区域
- **前视图**: 36个区域
- 经过600人验证的标准化工具

### 链接

1. **官方介绍**
   - https://painnews.stanford.edu/news/creating-new-tool-pain-choir-body-map-puts-pain-map

2. **颜色区域图 (ResearchGate)**
   - https://www.researchgate.net/figure/CHOIR-body-map-pain-regions-Left-arm-light-blue-right-arm-dark-blue-left-leg_fig1_360179159

3. **R包文档 (CHOIRBM)**
   - GitHub: https://github.com/emcramer/CHOIRBM
   - CRAN: https://cran.r-project.org/web/packages/CHOIRBM/readme/README.html

4. **学术论文**
   - PLOS: https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1010496
   - PMC验证研究: https://pmc.ncbi.nlm.nih.gov/articles/PMC7813550/
   - PubMed: https://pubmed.ncbi.nlm.nih.gov/33490848/

---

## 其他参考资源

### 交互式身体地图
- **Complex Spine London**: https://www.complexspine.london/body-map/
  - 可点击的脊柱区域图，分为颈椎、胸椎、腰椎等区域

### 背部疼痛图表
- **Back Pain Location Chart**: https://backmusclesolutions.com/blogs/the-ql-blawg/back-pain-location-chart
- **Female Back Pain Chart**: https://kingsspinecentre.com/female-back-pain-chart/
- **Holistic Billing Services**: https://holisticbillingservices.com/back-pain-location-chart-meaning/

### 物理治疗身体图表
- **Physiotherapy Body Chart Guide**: https://www.medesk.net/en/blog/physio-body-chart/
- **Body Works Physiotherapy**: https://body-works.ca/injury/back-pain/

### 数字疼痛地图研究
- **GRIP (Graphical Index of Pain)**: https://pmc.ncbi.nlm.nih.gov/articles/PMC7497597/
  - 167-168个详细疼痛位置点
- **Pain Frequency Maps Algorithm**: https://formative.jmir.org/2022/6/e36687/

---

## CHOIR Body Map 区域编码

- 以 `1` 开头的代码 = 前视图 (anterior)
- 以 `2` 开头的代码 = 后视图 (posterior)

### 后视图主要区域
- Neck (后颈)
- Upper back (上背)
- Mid back (中背)
- Low back (下背/腰部)
- Posterior shoulder (后肩) - 左右各一
- Hip (髋部) - 左右各一
- Upper arm posterior (上臂后侧)
- Lower arm posterior (前臂后侧)
- Thigh posterior (大腿后侧)
- Calf posterior (小腿后侧)

---

## 我们的简化版本 (14个区域)

| 区域 | 代码名称 | 对应CHOIR区域 |
|:---|:---|:---|
| 上颈椎 | upper_cervical | Neck upper |
| 下颈椎 | lower_cervical | Neck lower |
| 左上斜方肌 | left_upper_trap | Left posterior shoulder |
| 右上斜方肌 | right_upper_trap | Right posterior shoulder |
| 左菱形肌 | left_rhomboid | Left upper back |
| 右菱形肌 | right_rhomboid | Right upper back |
| 腰椎竖脊肌 | lumbar_erector | Mid/Low back |
| 左臀上肌 | left_upper_glute | Left hip upper |
| 右臀上肌 | right_upper_glute | Right hip upper |
| 左臀下肌 | left_lower_glute | Left hip lower |
| 右臀下肌 | right_lower_glute | Right hip lower |
| 左大腿后侧 | left_hamstring | Left thigh posterior |
| 右大腿后侧 | right_hamstring | Right thigh posterior |
| 左小腿后侧 | left_calf | Left calf posterior |
| 右小腿后侧 | right_calf | Right calf posterior |

---

*Created: 2025-12-10*
*Project: Low Back Pain System*
