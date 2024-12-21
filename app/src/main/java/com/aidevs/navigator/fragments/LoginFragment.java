package com.aidevs.navigator.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;

import com.aidevs.navigator.R;

public class LoginFragment extends Fragment {
    private EditText emailInput;
    private EditText passwordInput;
    private Button nextButton;

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container,
                            Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_login, container, false);
        
        emailInput = view.findViewById(R.id.emailInput);
        passwordInput = view.findViewById(R.id.passwordInput);
        nextButton = view.findViewById(R.id.nextButton);

        nextButton.setOnClickListener(v -> {
            // Add validation logic here
            Navigation.findNavController(v).navigate(R.id.action_login_to_map);
        });

        return view;
    }
} 