# 命名规范建议

文件命名规范通常需要考虑 **清晰性**、**一致性** 和 **可读性**，具体规则可以根据实际使用场景来制定。一个不好的例子是：`最终版_final(1).docx` 。

以下是一些通用的命名规范建议：  

### 1. **基本原则**  
✅ **简洁明了**：文件名应简短但能准确描述内容，不使用无意义的字符。  
✅ **使用小写字母+下划线/中划线（推荐）**：避免大小写混合，减少跨系统兼容性问题。  
✅ **避免特殊字符**：不使用 `空格`、`@`、`!`、`#`、`$` 等特殊字符，以免影响跨平台兼容性。  
✅ **保持一致性**：团队或公司内统一文件命名规则，方便检索和管理。  
✅ **使用时间戳**：可在文件名中加入日期时间，格式推荐 `YYYYMMDD` 或 `YYYY-MM-DD`。  
✅ **版本控制**：版本号推荐 `v1.0` 或 `_rev01` 形式，避免 `final_final` 之类的混乱命名。  

---  
### 2. **常见命名格式**  

#### ✅ **通用格式**  
```
[项目/类别]_[描述]_[日期]_[版本].[扩展名]
```
示例：
- `report_sales_20240320_v1.pdf`（销售报告 2024-03-20 版本1）
- `meeting_notes_projectX_202403.xlsx`（项目X会议记录 2024年3月）
- `backup_database_20240320.sql`（数据库备份 2024-03-20）

#### ✅ **代码文件**（小写+下划线/中划线）  
- `data_processor.py`
- `user_authentication.js`
- `config_settings.json`

#### ✅ **文档类文件**  
- `proposal_projectX_2024Q1.docx`
- `contract_supplier_ABC_v2.pdf`
- `training_guide_v1.1.pptx`

#### ✅ **图片/多媒体**  
- `product_shot_001.jpg`
- `logo_companyX_2024.png`
- `intro_video_v1.mp4`

#### ✅ **时间戳格式**（适用于日志、备份等）  
- `log_20240320_1530.txt`
- `backup_db_2024-03-20_1200.sql`

---

### 3. **不推荐的命名方式**
❌ **空格和特殊字符**  
```
合同 最终版.docx
报告(最新).pdf
```
（建议改为 `contract_final_v1.docx`，`report_latest.pdf`）

❌ **过于笼统或无意义的名称**  
```
新建文档.docx
图片1.jpg
数据.xlsx
```
（建议改为 `sales_data_202403.xlsx`）

❌ **大小写混合，影响兼容性**  
```
DataReport_FINAL.docx
ConfigSettings.JSON
```
（建议改为 `data_report_final.docx`，`config_settings.json`）