package com.websarva.wings.android.intentsample;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

/**
 * 『Androidアプリ開発の教科書』
 * 第7章
 * 画面遷移サンプル
 *
 * 注文完了画面のアクティビティクラス。
 *
 * @author Shinzo SAITO
 */
public class MenuThanksActivity extends AppCompatActivity {
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_menu_thanks);

		// インテントオブジェクトを取得。
		Intent intent = getIntent();
		// リスト画面から渡されたデータを取得。
		String menuName = intent.getStringExtra("menuName");
		String menuPrice = intent.getStringExtra("menuPrice");
//		Bundle extras = intent.getExtras();
//		String menuName = "";
//		String menuPrice = "";
//		if(extras != null) {
//			menuName = extras.getString("menuName");
//			menuPrice = extras.getString("menuPrice");
//		}

		// 定食名と金額を表示させるTextViewを取得。
		TextView tvMenuName = findViewById(R.id.tvMenuName);
		TextView tvMenuPrice = findViewById(R.id.tvMenuPrice);

		// TextViewに定食名と金額を表示。
		tvMenuName.setText(menuName);
		tvMenuPrice.setText(menuPrice);
	}

	/**
	 * 戻るボタンをタップした時の処理。
	 * @param view 画面部品。
	 */
	public void onBackButtonClick(View view) {
		finish();
	}
}
