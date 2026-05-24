import zipfile
import xml.etree.ElementTree as ET
import sys

def read_docx(path):
    try:
        with zipfile.ZipFile(path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            texts = []
            for paragraph in tree.findall('.//w:p', namespaces):
                para_texts = []
                for run in paragraph.findall('.//w:r', namespaces):
                    text_node = run.find('.//w:t', namespaces)
                    if text_node is not None and text_node.text:
                        para_texts.append(text_node.text)
                if para_texts:
                    texts.append(''.join(para_texts))
            return '\n'.join(texts)
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    print("=== Documento di Visione ===")
    print(read_docx('Documento di Visione.docx'))
    print("\n=== Documento di Ideazione ===")
    print(read_docx('Documento di Ideazione.docx'))
