from flask import Flask, render_template, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)

DATA_FILE = 'calorie_data.json'

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {'records': []}

def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/add', methods=['POST'])
def add_record():
    try:
        data = request.json
        date = data.get('date')
        meal = data.get('meal')
        calories = data.get('calories')
        
        if not all([date, meal, calories]):
            return jsonify({'success': False, 'message': '请填写完整信息'}), 400
        
        try:
            calories = float(calories)
        except ValueError:
            return jsonify({'success': False, 'message': '卡路里必须是数字'}), 400
        
        record = {
            'id': len(load_data()['records']) + 1,
            'date': date,
            'meal': meal,
            'calories': calories,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        data_store = load_data()
        data_store['records'].append(record)
        save_data(data_store)
        
        return jsonify({'success': True, 'message': '记录成功', 'record': record})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/records', methods=['GET'])
def get_records():
    try:
        data_store = load_data()
        records = data_store.get('records', [])
        
        date_filter = request.args.get('date')
        if date_filter:
            records = [r for r in records if r['date'] == date_filter]
        
        records.sort(key=lambda x: x['date'], reverse=True)
        
        daily_summary = {}
        for record in records:
            date = record['date']
            if date not in daily_summary:
                daily_summary[date] = {
                    'date': date,
                    'total_calories': 0,
                    'meals': []
                }
            daily_summary[date]['total_calories'] += record['calories']
            daily_summary[date]['meals'].append(record)
        
        summary_list = list(daily_summary.values())
        summary_list.sort(key=lambda x: x['date'], reverse=True)
        
        # 支持limit参数，限制返回的记录数量
        limit = request.args.get('limit', type=int)
        if limit:
            summary_list = summary_list[:limit]
        
        return jsonify({
            'success': True,
            'records': records,
            'summary': summary_list
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/delete/<int:record_id>', methods=['DELETE'])
def delete_record(record_id):
    try:
        data_store = load_data()
        original_count = len(data_store['records'])
        data_store['records'] = [r for r in data_store['records'] if r['id'] != record_id]
        
        if len(data_store['records']) == original_count:
            return jsonify({'success': False, 'message': '记录不存在'}), 404
        
        save_data(data_store)
        return jsonify({'success': True, 'message': '删除成功'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    try:
        data_store = load_data()
        records = data_store.get('records', [])
        
        if not records:
            return jsonify({
                'success': True,
                'stats': {
                    'total_records': 0,
                    'avg_daily_calories': 0,
                    'max_daily_calories': 0,
                    'min_daily_calories': 0
                }
            })
        
        daily_totals = {}
        for record in records:
            date = record['date']
            if date not in daily_totals:
                daily_totals[date] = 0
            daily_totals[date] += record['calories']
        
        totals = list(daily_totals.values())
        
        stats = {
            'total_records': len(records),
            'avg_daily_calories': round(sum(totals) / len(totals), 2),
            'max_daily_calories': max(totals),
            'min_daily_calories': min(totals),
            'total_days': len(totals)
        }
        
        return jsonify({'success': True, 'stats': stats})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500



if __name__ == '__main__':
    print("=" * 60)
    print("🍽️  卡路里追踪器正在启动...")
    print("=" * 60)
    
    if not os.path.exists(DATA_FILE):
        save_data({'records': []})
        print(f"✅ 已创建数据文件: {DATA_FILE}")
    
    print(f"📂 当前工作目录: {os.getcwd()}")
    print(f"🌐 请在浏览器中访问: http://localhost:5000")
    print("=" * 60)
    
    try:
        app.run(debug=True, port=5000, host='0.0.0.0')
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        import traceback
        traceback.print_exc()