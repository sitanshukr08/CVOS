import os
import subprocess
import jinja2

def escape_latex_chars(text):
    """Deeply escapes all edge-case LaTeX special characters to prevent crashes."""
    if not isinstance(text, str):
        return text
    
    text = text.replace('\\', r'\textbackslash{}')
    
    latex_special_chars = {
        '&': r'\&',
        '%': r'\%',
        '$': r'\$',
        '#': r'\#',
        '_': r'\_',
        '{': r'\{',
        '}': r'\}',
        '~': r'\textasciitilde{}',
        '^': r'\textasciicircum{}',
        '<': r'\textless{}',
        '>': r'\textgreater{}',
    }
    
    for char, escaped_char in latex_special_chars.items():
        text = text.replace(char, escaped_char)
        
    return text

def sanitize_dict(data):
    """Recursively sanitizes all strings in the data structure."""
    if isinstance(data, dict):
        return {k: sanitize_dict(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_dict(v) for v in data]
    elif isinstance(data, str):
        return escape_latex_chars(data)
    return data

def configure_jinja_for_latex():
    return jinja2.Environment(
        block_start_string=r'\BLOCK{',
        block_end_string='}',
        variable_start_string=r'\VAR{',
        variable_end_string='}',
        comment_start_string=r'\#{',
        comment_end_string='}',
        line_statement_prefix='%%',
        line_comment_prefix='%#',
        trim_blocks=True,
        autoescape=False,
        loader=jinja2.FileSystemLoader(os.path.abspath('.'))
    )

def generate_pdf(user_data: dict, output_filename: str = "ATS_Resume"):
    safe_data = sanitize_dict(user_data)
    
    env = configure_jinja_for_latex()
    template = env.get_template('resume_template.tex')
    
    rendered_tex = template.render(**safe_data)
    tex_filename = f"{output_filename}.tex"
    
    with open(tex_filename, "w", encoding="utf-8") as f:
        f.write(rendered_tex)
        
    print(f"Generated {tex_filename}")
    
    print("Compiling PDF (this may take a few seconds)...")
    try:
        subprocess.run(
            ["pdflatex", "-interaction=nonstopmode", "-halt-on-error", tex_filename], 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            check=True,
            timeout=15 
        )
        print(f"Successfully created {output_filename}.pdf!")
        
       
        for ext in ['.aux', '.log', '.out', '.tex']:
            if os.path.exists(f"{output_filename}{ext}"):
                os.remove(f"{output_filename}{ext}")
                
    except subprocess.TimeoutExpired:
        print("Error: LaTeX compilation timed out. Possible syntax lock.")
        raise Exception("PDF generation timed out.")
    except subprocess.CalledProcessError as e:
        print(f"Error compiling PDF. Check {output_filename}.log for details.")
        raise Exception("Failed to compile PDF.")