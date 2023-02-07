import requests
from bs4 import BeautifulSoup
import json
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from dotenv import load_dotenv
import os
import time
from selenium.webdriver.common.action_chains import ActionChains
from flask_cors import CORS, cross_origin
from revChatGPT.Official import Chatbot

from flask import Flask
from flask import request

load_dotenv()

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
chatbot = Chatbot(api_key=os.environ["API_KEY"])

def decompile(source):
    r = requests.post('https://ethervm.io/decompile',
                      data={'bytecode': source})
    return r.text


def decompileDeployed(address):
    r = requests.get('https://ethervm.io/decompile/' + address)
    soup = BeautifulSoup(r.text, 'html.parser')
    arr = soup.find_all('div', class_='code javascript')
    assert (len(arr) == 1)
    t = arr[0].text
    return t


def split_functions(code: str):
    result = dict()
    lines = code.split('\n')
    i = 1
    currfun = ""
    while i < len(lines):
        line = lines[i]
        if line.startswith('    function'):
            funidx = line.index('function ') + len('function ')
            funname = line[funidx:]
            funname = funname[:funname.index('(')]
            currfun = line + '\n'
            brac = 0
            for c in line:
                if c == '{':
                    brac += 1
                elif c == '}':
                    brac -= 1
            if brac == 0:
                result[funname] = line
                i += 1
                continue
            i += 1
            while not lines[i].startswith('    }'):
                currfun += lines[i] + '\n'
                i += 1
            currfun += lines[i]
            result[funname] = currfun
        i += 1
    return result


def remove_comments(code: str):
    lines = code.split('\n')
    result = ""
    for line in lines:
        if "//" in line:
            idx = line.index("//")
            line = line[:idx]
        result += line + '\n'
    return result


def main_anal(main_src: str):
    result = dict()
    lines = main_src.split('\n')
    i = 1
    while i < len(lines):
        line = lines[i]
        if 'if (var0 == 0x' in line:
            idx = line.index('if (var0 == 0x') + len('if (var0 == 0x')
            fourbyte = line[idx:idx+8]
            # print(fourbyte)
            i += 1
            dispatchcode = ""
            brac = 1
            while True:
                line = lines[i]
                flag = False
                for c in line:
                    if c == '{':
                        brac += 1
                    elif c == '}':
                        brac -= 1
                        if brac == 0:
                            flag = True
                            break
                if flag:
                    break
                else:
                    dispatchcode += line + '\n'
                    i += 1
            result[fourbyte] = dispatchcode
        else:
            i += 1
    return result


def find_calls(lines, cache, functions):
    sanitized = ""
    for line in lines.split('\n'):
        if "//" not in line:
            sanitized += line + "\n"

    calls = re.findall("([a-zA-Z0-9_]+)\(([a-zA-Z0-9_\, ]*)\)", sanitized)
    calls = set([i for i, _ in calls])

    print(calls)
    print(lines)
    calls_temp = set()
    for call in calls:
        if call not in cache:
            cache.add(call)
            calls_temp1, cache_tamp = find_calls(
                functions[call], cache, functions)
            cache.update(cache_tamp)
            calls_temp.update(calls_temp1)
    calls.update(calls_temp)
    return calls, cache


def use_browser(gpt_code):
    response = chatbot.ask(gpt_code)
    print(response)
    return response["choices"][0]["text"]


def table_inlining(switch_table: dict, fourbyte: str, functions: dict):
    dispatch = switch_table[fourbyte]
    # dependencies = set()
    # RIP
    calls, _ = find_calls(dispatch, set(), functions)
    print(calls)
    dependencies = ''
    # for func in functions.keys():
    for func in calls:
        if "main" not in func:
            dependencies += f"{functions[func]}\n\n"

    gpt_code = "contract Contract {\n" + dependencies + \
        "   function main() {\n" + dispatch + "\n   }\n}"
    print(gpt_code)
    # print(dispatch)
    # print(find_calls(gpt_code))
    gpt_code = "Explain the main function of this solidity code:\n " + gpt_code
    gpt_code = remove_comments(gpt_code)
    return gpt_code


from snaps_backend.decompiler import decompile_address, decompile_bytecode
from snaps_backend.utils.supplement import fetch_sig

ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
def get_gpt_query_new(contract_addr, four_byte):
    if "main" in four_byte:
        fname = f"main"
    else:
        t = fetch_sig(four_byte)
        if t:
            fname = t['name']
        else:
            fname = f"unknown{four_byte}"
        # fname = f"unknown{four_byte}"
    gpt_code = decompile_address(contract_addr, None).text
    gpt_code = "\n".join(gpt_code.split('\n')[1:])
    gpt_code = ansi_escape.sub('', gpt_code)
    gpt_code = gpt_code.lstrip()
    gpt_code = f"Explain the {fname} function of this ethereum pseudocode:\n " + gpt_code
    return gpt_code
# def dependency_graph(func):

def get_desc(contract_addr, four_byte):
    # t = decompileDeployed(f'goerli/{contract_addr}')
    # functions = split_functions(t)
    # functions['stop'] = ''
    # disp_table = main_anal(functions['main'])
    gpt_code = get_gpt_query_new(contract_addr, four_byte)
    return use_browser(gpt_code)

def get_desc_q(queue, contract_addr, four_byte):
    # t = decompileDeployed(f'goerli/{contract_addr}')
    # functions = split_functions(t)
    # functions['stop'] = ''
    # disp_table = main_anal(functions['main'])
    gpt_code = get_gpt_query_new(contract_addr, four_byte)
    queue.put(use_browser(gpt_code))

from multiprocessing import Process, Queue
def get_desc_new_process(contract_addr, four_byte):
    q = Queue()
    p = Process(target=get_desc_q, args=(q, contract_addr, four_byte))
    p.start()
    p.join()
    return q.get()

@app.route("/description", methods=["GET"])
@cross_origin()
def hello_world():
    contract_addr = request.args.get('contract_addr')   
    four_byte = request.args.get('four_byte')
    fuck = get_desc_new_process(contract_addr, four_byte)
    return {"description": fuck}

# def main():
    # t = decompile('0x6060604052341561000f57600080fd5b604051602080610149833981016040528080519060200190919050505b806000819055505b505b6101a88061005a6000396000f30060606040526000357c01000')
    # t = decompile("608060405234801561001057600080fd5b506004361061002b5760003560e01c80636d4ce63c14610030575b600080fd5b61003861004e565b604051610045919061011b565b60405180910390f35b60606040518060400160405280600b81526020017f48656c6c6f20576f726c64000000000000000000000000000000000000000000815250905090565b600081519050919050565b600082825260208201905092915050565b60005b838110156100c55780820151818401526020810190506100aa565b60008484015250505050565b6000601f19601f8301169050919050565b60006100ed8261008b565b6100f78185610096565b93506101078185602086016100a7565b610110816100d1565b840191505092915050565b6000602082019050818103600083015261013581846100e2565b90509291505056fea264697066735822122060d589c0326dc8c65fc912551940071d46baa60a7a71c31b811b740531ee629964736f6c63430008110033")
    # t = decompileDeployed('0x949a6ac29b9347b3eb9a420272a9dd7890b787a3')
    # t = decompileDeployed('goerli/0x7C8C21927530f3776F6C057B71E408D88ABbb881')
    # t = decompileDeployed('goerli/0x138B359b8239B85793D8749De2C055b4e57e8958')
    # t = decompileDeployed('goerli/0x773E6AA19BAB7bc35F49f6ced6fd6109F775B949')
    # t = decompileDeployed('goerli/0xcd752a50d5eb0ff53d0f87fb57208c961646e1ad')
    # functions = split_functions(t)
    # disp_table = main_anal(functions['main'])
    # table_inlining(disp_table, "12065fe0", functions)
    # get_desc("0xcd752a50d5eb0ff53d0f87fb57208c961646e1ad", "12065fe0")
    # table_inlining(disp_table, "013cf08b", functions)

# main()


if __name__ == '__main__':
    load_dotenv()
    app.run(port=os.environ["PORT"], debug=True, host='0.0.0.0')
