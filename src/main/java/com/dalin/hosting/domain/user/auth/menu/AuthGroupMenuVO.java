package com.dalin.hosting.domain.user.auth.menu;

import com.dalin.hosting.domain.program.Program;
import lombok.Data;

import java.util.List;

@Data
public class AuthGroupMenuVO {

    private List<AuthGroupMenu> list;

    private Program program;
}
